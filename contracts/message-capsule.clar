;; time-capsule contract
(define-map messages 
    { message-id: uint }
    { 
        sender: principal,
        recipient: principal,
        message: (string-utf8 500),
        unlock-height: uint,
        is-revealed: bool,
        is-encrypted: bool,
        reward: uint,
        created-at: uint
    }
)

(define-data-var message-counter uint u0)

;; Error codes
(define-constant err-already-revealed (err u100))
(define-constant err-not-unlocked-yet (err u101))
(define-constant err-not-recipient (err u102))
(define-constant err-message-not-found (err u103))
(define-constant err-insufficient-funds (err u104))

;; Store a new message
(define-public (store-message (recipient principal) (message (string-utf8 500)) (blocks-until-unlock uint) (is-encrypted bool) (reward uint))
    (let 
        (
            (message-id (var-get message-counter))
            (unlock-height (+ block-height blocks-until-unlock))
        )
        (asserts! (>= (stx-get-balance tx-sender) reward) err-insufficient-funds)
        
        (map-insert messages
            { message-id: message-id }
            {
                sender: tx-sender,
                recipient: recipient,
                message: message,
                unlock-height: unlock-height,
                is-revealed: false,
                is-encrypted: is-encrypted,
                reward: reward,
                created-at: block-height
            }
        )
        (var-set message-counter (+ message-id u1))
        (if (> reward u0)
            (stx-transfer? reward tx-sender (as-contract tx-sender))
            (ok true)
        )
        (ok message-id)
    )
)

;; Reveal a message
(define-public (reveal-message (message-id uint))
    (let (
        (message (unwrap! (map-get? messages { message-id: message-id }) err-message-not-found))
    )
        (asserts! (is-eq (get recipient message) tx-sender) err-not-recipient)
        (asserts! (>= block-height (get unlock-height message)) err-not-unlocked-yet)
        (asserts! (not (get is-revealed message)) err-already-revealed)
        
        (map-set messages
            { message-id: message-id }
            (merge message { is-revealed: true })
        )

        ;; Transfer reward if any
        (if (> (get reward message) u0)
            (stx-transfer? (get reward message) (as-contract tx-sender) tx-sender)
            (ok true)
        )
        
        (ok (get message message))
    )
)

;; Read-only functions
(define-read-only (get-message-details (message-id uint))
    (map-get? messages { message-id: message-id })
)

(define-read-only (is-message-unlocked (message-id uint))
    (let (
        (message (unwrap! (map-get? messages { message-id: message-id }) err-message-not-found))
    )
        (>= block-height (get unlock-height message))
    )
)

(define-read-only (get-message-age (message-id uint))
    (let (
        (message (unwrap! (map-get? messages { message-id: message-id }) err-message-not-found))
    )
        (- block-height (get created-at message))
    )
)

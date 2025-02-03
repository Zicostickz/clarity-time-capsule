# Blockchain Time Capsule

A decentralized time capsule system that allows users to store messages that can only be revealed after a specified number of blocks have been mined.

## Features

- Store encrypted messages with a specified unlock time
- Messages can only be revealed by the intended recipient
- Messages can only be revealed after the specified block height is reached
- Optional end-to-end encryption support for sensitive messages
- STX reward system to incentivize recipients
- Immutable record of message history
- Transparent and verifiable delivery system
- Message age tracking and timestamp information

## Use Cases

- Scheduled message delivery
- Digital legacy planning
- Time-locked announcements 
- Future-dated communications
- Incentivized information delivery
- Secure time-delayed communications
- Message authenticity verification through timestamps

## New Features

### Message Encryption
Messages can now be marked as encrypted, allowing for end-to-end encryption implementation by the frontend application. This enables secure storage of sensitive information.

### STX Rewards
Senders can now attach STX tokens as rewards for recipients. The rewards are held in escrow by the contract and automatically transferred to recipients upon message revelation. This creates an incentive mechanism for time-sensitive information delivery.

### Message Timestamps
Each message now includes a creation timestamp (block height) and supports age tracking functionality. This enables verification of message authenticity and helps track the chronological order of messages.

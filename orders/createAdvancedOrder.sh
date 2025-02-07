#!/bin/bash
source .env

just create-advanced-order \
    "$PRICE_CONDITION" \
    "$ORACLE_PRICE_PAIR" \
    "$PREDICT_PRICE_PAIR" \
    "$TX_FIELDS" \
    "$KEY_ID" \
    "$SPACE_NONCE" \
    "$ACTION_TIMEOUT_HEIGHT" \
    "$EXPECTED_APPROVE_EXPRESSION" \
    "$EXPECTED_REJECT_EXPRESSION" \
    "$SALT" \
    "$FACTORY_ADDRESS" \
    "$RPC_URL" \
    "$CHAIN_ID"

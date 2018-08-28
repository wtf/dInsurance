# Avoiding Common Attacks

1. Re-entrancy has been avoided by using `.transfer()` instead of `.call.value()` or `.send()` which are less secure
2. **Checks-Effects-Interaction** has been implemented - First checking Policy .`state == PENDING`, then setting `.state = RELEASED` and only then making a `.transfer()` call.
3. `OpenZeppelin.SafeMath` is used whenever performing any mathematical operations. The only exceptions are for-loop counters which use `counter++` in the for loop anyway, and do not threaten any loss of funds or DoS.
4. Only Policy owners are allowed to call `force_release`.
5. Oracle callbacks are authenticated by ensuring that the calling address belongs to Oraclize.
6. DoS on Oraclize callbacks is avoided by using `queryIndexes` to ensure that every Oraclize query can only trigger the `__callback()` function only once.

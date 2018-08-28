# Design Pattern Decisions

I had to decide between implementing each _policy_ as a separate contract, or creating a `struct` of policies all within a single contract. I decided upon the latter - it makes it far easier to manage all the policies from one place and call them, especially from oracles. Instead of having a bunch of "policy" contracts each being called separately by Oraclize which would be too messy, this is much cleaner.

Although I could have maintained a list of contracts by their addresses, it would be more cumbersome to use the main contract for retrieving, modifying and deleting/deactivating the policies.

Creating a Policy Factory was another option did not make sense because the _policy_ contracts do not have to interact with each other.

Moreover, since this is a proof-of-concept and not a battle-grade application, it is more secure to have all the policies in one place, so that a new contract may be implemented with all the policies and the current one destroyed.

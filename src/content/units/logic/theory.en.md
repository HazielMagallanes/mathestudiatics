## Propositions

A **proposition** is a declarative sentence that can be either true or false,
but not both. Questions, orders and wishes are not propositions; expressions
with free variables (such as $x + 1 = 3$) are not either, because their truth
value depends on the variable.

## Connectives

| Connective    | Symbol                | Reads                    | True when…                     |
| ------------- | --------------------- | ------------------------ | ------------------------------ |
| Negation      | $\lnot p$             | "not $p$"                | $p$ is false                   |
| Conjunction   | $p \land q$           | "$p$ and $q$"            | both are true                  |
| Disjunction   | $p \lor q$            | "$p$ or $q$"             | at least one is true           |
| Conditional   | $p \Rightarrow q$     | "if $p$, then $q$"       | $p$ is false or $q$ is true    |
| Biconditional | $p \Leftrightarrow q$ | "$p$ if and only if $q$" | they have the same truth value |

In the conditional, $p$ is the **antecedent** and $q$ the **consequent**. The
only case where $p \Rightarrow q$ is false is when the antecedent is true and the
consequent is false.

## Truth tables and classification

A truth table lists the value of a formula for every possible combination of its
variables: with $n$ variables there are $2^n$ rows. A formula is classified by
its final column:

- **Tautology**: always true.
- **Contradiction**: always false.
- **Contingency**: true in some cases and false in others.

## Key equivalences

$$
\begin{gathered}
\lnot(p \land q) \Leftrightarrow \lnot p \lor \lnot q \\
\lnot(p \lor q) \Leftrightarrow \lnot p \land \lnot q
\end{gathered}
$$

$$
\begin{gathered}
p \Rightarrow q \Leftrightarrow \lnot q \Rightarrow \lnot p \\
p \Leftrightarrow q \Leftrightarrow (p \Rightarrow q) \land (q \Rightarrow p)
\end{gathered}
$$

The **contrapositive** ($\lnot q \Rightarrow \lnot p$) is equivalent to the
original conditional; the **converse** ($q \Rightarrow p$) is not.

## Quantifiers

Over a domain $D$:

- $\forall x \in D: P(x)$ is true when **every** element satisfies $P$; a single
  counterexample makes it false.
- $\exists x \in D: P(x)$ is true when **at least one** element satisfies $P$; a
  single example makes it true.

Negation swaps the quantifiers:
$\lnot \forall x: P(x) \Leftrightarrow \exists x: \lnot P(x)$.

$$
$$

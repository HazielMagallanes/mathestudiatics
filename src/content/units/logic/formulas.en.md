| Connective    | Formula               | Comment                             |
| ------------- | --------------------- | ----------------------------------- |
| Negation      | $\lnot p$             | flips the truth value               |
| Conjunction   | $p \land q$           | false if either is false            |
| Disjunction   | $p \lor q$            | false only if both are false        |
| Conditional   | $p \Rightarrow q$     | false only if $p$ is T and $q$ is F |
| Biconditional | $p \Leftrightarrow q$ | true when they agree                |

## De Morgan laws

$$
\begin{gathered}
\lnot(p \land q) \Leftrightarrow \lnot p \lor \lnot q \\
\lnot(p \lor q) \Leftrightarrow \lnot p \land \lnot q
\end{gathered}
$$

## Notable equivalences

| Name                              | Equivalence                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------- |
| Contrapositive                    | $p \Rightarrow q \Leftrightarrow \lnot q \Rightarrow \lnot p$                   |
| Biconditional as two conditionals | $p \Leftrightarrow q \Leftrightarrow (p \Rightarrow q) \land (q \Rightarrow p)$ |
| Distributive                      | $p \land (q \lor r) \Leftrightarrow (p \land q) \lor (p \land r)$               |
| Implication as a disjunction      | $p \Rightarrow q \Leftrightarrow \lnot p \lor q$                                |
| Double negation                   | $\lnot(\lnot p) \Leftrightarrow p$                                              |

## Quantifiers and their negations

$$\lnot\left(\forall x \in D: P(x)\right) \Leftrightarrow \exists x \in D: \lnot P(x)$$

$$\lnot\left(\exists x \in D: P(x)\right) \Leftrightarrow \forall x \in D: \lnot P(x)$$

$$
$$

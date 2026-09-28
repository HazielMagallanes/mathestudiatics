| Conectiva     | Fórmula               | Comentario                        |
| ------------- | --------------------- | --------------------------------- |
| Negación      | $\lnot p$             | invierte el valor de verdad       |
| Conjunción    | $p \land q$           | falsa si alguna es falsa          |
| Disyunción    | $p \lor q$            | falsa sólo si ambas son falsas    |
| Condicional   | $p \Rightarrow q$     | falsa sólo si $p$ es V y $q$ es F |
| Bicondicional | $p \Leftrightarrow q$ | verdadera si coinciden            |

## Leyes de De Morgan

$$
\begin{gathered}
\lnot(p \land q) \Leftrightarrow \lnot p \lor \lnot q \\
\lnot(p \lor q) \Leftrightarrow \lnot p \land \lnot q
\end{gathered}
$$

## Equivalencias notables

| Nombre                                  | Equivalencia                                                                    |
| --------------------------------------- | ------------------------------------------------------------------------------- |
| Contrarrecíproca                        | $p \Rightarrow q \Leftrightarrow \lnot q \Rightarrow \lnot p$                   |
| Bicondicional como par de condicionales | $p \Leftrightarrow q \Leftrightarrow (p \Rightarrow q) \land (q \Rightarrow p)$ |
| Distributiva                            | $p \land (q \lor r) \Leftrightarrow (p \land q) \lor (p \land r)$               |
| Implicación como disyunción             | $p \Rightarrow q \Leftrightarrow \lnot p \lor q$                                |
| Doble negación                          | $\lnot(\lnot p) \Leftrightarrow p$                                              |

## Cuantificadores y sus negaciones

$$\lnot\left(\forall x \in D: P(x)\right) \Leftrightarrow \exists x \in D: \lnot P(x)$$

$$\lnot\left(\exists x \in D: P(x)\right) \Leftrightarrow \forall x \in D: \lnot P(x)$$

$$
$$

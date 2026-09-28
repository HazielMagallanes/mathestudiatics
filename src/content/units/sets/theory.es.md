## Definición y notación

Un **conjunto** es una colección de objetos, llamados **elementos**. Se define
por **extensión** cuando se listan sus elementos y por **comprensión** cuando se
describe una condición:

$$
\begin{gathered}
A = \left\{1, 2, 3\right\} \\
B = \left\{x \in \mathbb{Z}: -3 \le x < 5\right\}
\end{gathered}
$$

La pertenencia se escribe $x \in A$ y la no pertenencia $x \notin A$. El
conjunto vacío se denota $\varnothing$ o $\left\{\right\}$.

## Subconjuntos

$A$ es **subconjunto** de $B$ ($A \subseteq B$) si todo elemento de $A$ está en
$B$. Si además $A \neq B$, es un **subconjunto propio** ($A \subset B$).

Un conjunto con $n$ elementos tiene $2^n$ subconjuntos y $2^n - 1$ subconjuntos
propios: es el **conjunto de partes** $\mathcal{P}(A)$.

## Operaciones

| Operación            | Notación        | Definición                                 |
| -------------------- | --------------- | ------------------------------------------ |
| Unión                | $A \cup B$      | elementos que están en $A$ o en $B$        |
| Intersección         | $A \cap B$      | elementos que están en $A$ y en $B$        |
| Diferencia           | $A \setminus B$ | elementos de $A$ que no están en $B$       |
| Complemento          | $A^c$           | elementos del universo que no están en $A$ |
| Diferencia simétrica | $A \triangle B$ | elementos que están en uno solo de los dos |

Dos conjuntos son **disjuntos** si $A \cap B = \varnothing$.

## Cardinalidad

La **cardinalidad** $\left|A\right|$ es la cantidad de elementos. Para dos
conjuntos finitos vale el principio de inclusión-exclusión:

$$\left|A \cup B\right| = \left|A\right| + \left|B\right| - \left|A \cap B\right|$$

## Intervalos como conjuntos

Un intervalo es un conjunto de números reales:

$$
\begin{gathered}
\left[a, b\right] = \left\{x \in \mathbb{R}: a \le x \le b\right\} \\
\left(a, b\right) = \left\{x \in \mathbb{R}: a < x < b\right\}
\end{gathered}
$$

Los intervalos se pueden unir e intersectar como cualquier conjunto; la
intersección de dos intervalos es otro intervalo (o el conjunto vacío).

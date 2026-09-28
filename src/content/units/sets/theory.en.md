## Definition and notation

A **set** is a collection of objects, called **elements**. It is defined by
**extension** when its elements are listed, and by **comprehension** when a
condition is described:

$$
\begin{gathered}
A = \left\{1, 2, 3\right\} \\
B = \left\{x \in \mathbb{Z}: -3 \le x < 5\right\}
\end{gathered}
$$

Membership is written $x \in A$ and non-membership $x \notin A$. The empty set
is denoted $\varnothing$ or $\left\{\right\}$.

## Subsets

$A$ is a **subset** of $B$ ($A \subseteq B$) when every element of $A$ is in
$B$. If additionally $A \neq B$, it is a **proper subset** ($A \subset B$).

A set with $n$ elements has $2^n$ subsets and $2^n - 1$ proper subsets: that is
the **power set** $\mathcal{P}(A)$.

## Operations

| Operation            | Notation        | Definition                          |
| -------------------- | --------------- | ----------------------------------- |
| Union                | $A \cup B$      | elements in $A$ or in $B$           |
| Intersection         | $A \cap B$      | elements in $A$ and in $B$          |
| Difference           | $A \setminus B$ | elements of $A$ not in $B$          |
| Complement           | $A^c$           | elements of the universe not in $A$ |
| Symmetric difference | $A \triangle B$ | elements in exactly one of the two  |

Two sets are **disjoint** when $A \cap B = \varnothing$.

## Cardinality

The **cardinality** $\left|A\right|$ is the number of elements. For two finite
sets the inclusion–exclusion principle holds:

$$\left|A \cup B\right| = \left|A\right| + \left|B\right| - \left|A \cap B\right|$$

## Intervals as sets

An interval is a set of real numbers:

$$
\begin{gathered}
\left[a, b\right] = \left\{x \in \mathbb{R}: a \le x \le b\right\} \\
\left(a, b\right) = \left\{x \in \mathbb{R}: a < x < b\right\}
\end{gathered}
$$

Intervals can be joined and intersected like any set; the intersection of two
intervals is another interval (or the empty set).

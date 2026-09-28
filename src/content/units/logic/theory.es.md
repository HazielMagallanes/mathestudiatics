## Proposiciones

Una **proposición** es una oración declarativa que puede ser verdadera o falsa,
pero no ambas. Las preguntas, las órdenes y los deseos no son proposiciones; las
expresiones con variables libres (como $x + 1 = 3$) tampoco, porque su valor de
verdad depende de la variable.

## Conectivas

| Conectiva     | Símbolo               | Se lee                 | Es verdadera cuando…            |
| ------------- | --------------------- | ---------------------- | ------------------------------- |
| Negación      | $\lnot p$             | "no $p$"               | $p$ es falsa                    |
| Conjunción    | $p \land q$           | "$p$ y $q$"            | ambas son verdaderas            |
| Disyunción    | $p \lor q$            | "$p$ o $q$"            | al menos una es verdadera       |
| Condicional   | $p \Rightarrow q$     | "si $p$, entonces $q$" | $p$ es falsa o $q$ es verdadera |
| Bicondicional | $p \Leftrightarrow q$ | "$p$ si y sólo si $q$" | tienen el mismo valor de verdad |

En el condicional, $p$ es el **antecedente** y $q$ el **consecuente**. El único
caso en que $p \Rightarrow q$ es falsa es cuando el antecedente es verdadero y el
consecuente es falso.

## Tablas de verdad y clasificación

Una tabla de verdad lista el valor de una fórmula para cada combinación posible
de sus variables: con $n$ variables hay $2^n$ filas. Una fórmula se clasifica
según su columna final:

- **Tautología**: siempre verdadera.
- **Contradicción**: siempre falsa.
- **Contingencia**: verdadera en algunos casos y falsa en otros.

## Equivalencias importantes

$$
\lnot(p \land q) \Leftrightarrow \lnot p \lor \lnot q, \qquad
\lnot(p \lor q) \Leftrightarrow \lnot p \land \lnot q
$$

$$
p \Rightarrow q \Leftrightarrow \lnot q \Rightarrow \lnot p, \qquad
p \Leftrightarrow q \Leftrightarrow (p \Rightarrow q) \land (q \Rightarrow p)
$$

La **contrarrecíproca** ($\lnot q \Rightarrow \lnot p$) es equivalente al
condicional original; la **recíproca** ($q \Rightarrow p$) no lo es.

## Cuantificadores

Sobre un dominio $D$:

- $\forall x \in D: P(x)$ es verdadera si **todos** los elementos cumplen $P$;
  alcanza un contraejemplo para que sea falsa.
- $\exists x \in D: P(x)$ es verdadera si **al menos un** elemento cumple $P$;
  alcanza un ejemplo para que sea verdadera.

La negación intercambia los cuantificadores:
$\lnot \forall x: P(x) \Leftrightarrow \exists x: \lnot P(x)$.

$$
$$

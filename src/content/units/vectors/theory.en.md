## Components

A vector in the plane is written with its **components**:
$\vec{u} = \left(u_x, u_y\right)$, and in space
$\vec{u} = \left(u_x, u_y, u_z\right)$. The vector from point $A$ to point $B$
is obtained by subtracting coordinates:

$$\vec{AB} = B - A$$

## Operations

Addition and subtraction work **component-wise**, and multiplying by a scalar
multiplies each component:

$$
\begin{gathered}
\vec{u} + \vec{v} = \left(u_x + v_x,; u_y + v_y\right) \\
k\vec{u} = \left(ku_x,\; ku_y\right)
\end{gathered}
$$

Geometrically, the sum is represented with the parallelogram rule.

## Norm

The **norm** (or magnitude) is the length of the vector and follows from the
Pythagorean theorem:

$$\left\|\vec{u}\right\| = \sqrt{u_x^2 + u_y^2 + u_z^2}$$

A **unit vector** has norm $1$; it is obtained by dividing a vector by its norm.
The distance between two points is the norm of the vector joining them.

## Dot product

$$\vec{u} \cdot \vec{v} = u_xv_x + u_yv_y + u_zv_z$$

The dot product gives the angle between two vectors:

$$\cos\theta = \frac{\vec{u} \cdot \vec{v}}{\left\|\vec{u}\right\|\left\|\vec{v}\right\|}$$

## Parallelism and orthogonality

- Two vectors are **orthogonal** (perpendicular) when their dot product is zero:
  $\vec{u} \cdot \vec{v} = 0$.
- Two vectors are **parallel** when one is a scalar multiple of the other:
  $\vec{v} = k\vec{u}$. In the plane this is equivalent to the determinant
  $u_xv_y - u_yv_x$ being zero.

## Applications

From the norm and the direction (an angle) the components of a vector follow:
$v_x = \left\|\vec{v}\right\|\cos\theta$ and
$v_y = \left\|\vec{v}\right\|\sin\theta$.

$$
$$

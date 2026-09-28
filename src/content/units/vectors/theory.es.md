## Componentes

Un vector en el plano se escribe con sus **componentes**:
$\vec{u} = \left(u_x, u_y\right)$, y en el espacio
$\vec{u} = \left(u_x, u_y, u_z\right)$. El vector que va del punto $A$ al punto
$B$ se obtiene restando coordenadas:

$$\vec{AB} = B - A$$

## Operaciones

La suma y la resta se hacen **componente a componente**, y el producto por un
escalar multiplica cada componente:

$$ \vec{u} + \vec{v} = \left(u_x + v_x,; u_y + v_y\right), \qquad
k\vec{u} = \left(ku_x,\; ku_y\right)$$

Geométricamente, la suma se representa con la regla del paralelogramo.

## Norma

La **norma** (o módulo) es la longitud del vector y se calcula con el teorema de
Pitágoras:

$$\left\|\vec{u}\right\| = \sqrt{u_x^2 + u_y^2 + u_z^2}$$

Un **vector unitario** tiene norma $1$; se obtiene dividiendo un vector por su
norma. La distancia entre dos puntos es la norma del vector que los une.

## Producto escalar

$$\vec{u} \cdot \vec{v} = u_xv_x + u_yv_y + u_zv_z$$

El producto escalar permite calcular el ángulo entre dos vectores:

$$\cos\theta = \frac{\vec{u} \cdot \vec{v}}{\left\|\vec{u}\right\|\left\|\vec{v}\right\|}$$

## Paralelismo y ortogonalidad

- Dos vectores son **ortogonales** (perpendiculares) si su producto escalar es
  cero: $\vec{u} \cdot \vec{v} = 0$.
- Dos vectores son **paralelos** si uno es múltiplo escalar del otro:
  $\vec{v} = k\vec{u}$. En el plano, esto equivale a que el determinante
  $u_xv_y - u_yv_x$ sea cero.

## Aplicaciones

Con la norma y la dirección (un ángulo) se obtienen las componentes de un
vector: $v_x = \left\|\vec{v}\right\|\cos\theta$ y
$v_y = \left\|\vec{v}\right\|\sin\theta$.
$$

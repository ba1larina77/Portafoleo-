# Fórmulas de Derivación e Integración

## Derivadas

### Básicas
- d/dx(k) = 0
- d/dx(x) = 1
- d/dx(xⁿ) = n·xⁿ⁻¹
- d/dx(k·f(x)) = k·f'(x)

### Operaciones
- (f ± g)' = f' ± g'
- (f·g)' = f'g + fg'
- (f/g)' = (f'g − fg')/g²
- (f∘g)'(x) = f'(g(x))·g'(x)  [regla de la cadena]

### Exponenciales y logarítmicas
- d/dx(eˣ) = eˣ
- d/dx(aˣ) = aˣ·ln(a)
- d/dx(ln x) = 1/x
- d/dx(logₐ x) = 1/(x·ln a)

### Trigonométricas
- d/dx(sen x) = cos x
- d/dx(cos x) = −sen x
- d/dx(tan x) = sec²x
- d/dx(cot x) = −csc²x
- d/dx(sec x) = sec x·tan x
- d/dx(csc x) = −csc x·cot x

### Trigonométricas inversas
- d/dx(arcsen x) = 1/√(1−x²)
- d/dx(arccos x) = −1/√(1−x²)
- d/dx(arctan x) = 1/(1+x²)
- d/dx(arccot x) = −1/(1+x²)
- d/dx(arcsec x) = 1/(|x|√(x²−1))
- d/dx(arccsc x) = −1/(|x|√(x²−1))

---

## Identidades trigonométricas

### Pitagóricas
- sen²x + cos²x = 1
- 1 + tan²x = sec²x
- 1 + cot²x = csc²x

### Suma y resta de ángulos
- sen(a ± b) = sen a·cos b ± cos a·sen b
- cos(a ± b) = cos a·cos b ∓ sen a·sen b
- tan(a ± b) = (tan a ± tan b)/(1 ∓ tan a·tan b)

### Ángulo doble
- sen 2x = 2·sen x·cos x
- cos 2x = cos²x − sen²x = 2cos²x − 1 = 1 − 2sen²x
- tan 2x = 2tan x/(1 − tan²x)

### Ángulo mitad
- sen(x/2) = ±√[(1 − cos x)/2]
- cos(x/2) = ±√[(1 + cos x)/2]
- tan(x/2) = ±√[(1 − cos x)/(1 + cos x)] = sen x/(1 + cos x) = (1 − cos x)/sen x

### Reducción de potencias (muy usadas en integrales)
- sen²x = (1 − cos 2x)/2
- cos²x = (1 + cos 2x)/2
- tan²x = sec²x − 1

### Producto a suma
- sen a·cos b = ½[sen(a+b) + sen(a−b)]
- cos a·cos b = ½[cos(a−b) + cos(a+b)]
- sen a·sen b = ½[cos(a−b) − cos(a+b)]

### Suma a producto
- sen a + sen b = 2·sen[(a+b)/2]·cos[(a−b)/2]
- sen a − sen b = 2·cos[(a+b)/2]·sen[(a−b)/2]
- cos a + cos b = 2·cos[(a+b)/2]·cos[(a−b)/2]
- cos a − cos b = −2·sen[(a+b)/2]·sen[(a−b)/2]

### Recíprocas y cociente
- csc x = 1/sen x
- sec x = 1/cos x
- cot x = 1/tan x = cos x/sen x
- tan x = sen x/cos x

---

## Integrales

### Básicas
- ∫k dx = kx + C
- ∫xⁿ dx = xⁿ⁺¹/(n+1) + C, (n ≠ −1)
- ∫(1/x) dx = ln|x| + C
- ∫k·f(x) dx = k∫f(x) dx
- ∫(f ± g) dx = ∫f dx ± ∫g dx

### Exponenciales y logarítmicas
- ∫eˣ dx = eˣ + C
- ∫aˣ dx = aˣ/ln(a) + C

### Trigonométricas
- ∫sen x dx = −cos x + C
- ∫cos x dx = sen x + C
- ∫sec²x dx = tan x + C
- ∫csc²x dx = −cot x + C
- ∫sec x·tan x dx = sec x + C
- ∫csc x·cot x dx = −csc x + C
- ∫tan x dx = −ln|cos x| + C
- ∫cot x dx = ln|sen x| + C
- ∫sec x dx = ln|sec x + tan x| + C
- ∫csc x dx = ln|csc x − cot x| + C

### Que dan inversas trigonométricas
- ∫1/√(a²−x²) dx = arcsen(x/a) + C
- ∫1/(a²+x²) dx = (1/a)arctan(x/a) + C
- ∫1/(x√(x²−a²)) dx = (1/a)arcsec(|x|/a) + C

### Técnicas (fórmulas clave)
- Sustitución: ∫f(g(x))·g'(x) dx = ∫f(u) du, con u = g(x)
- Por partes: ∫u dv = uv − ∫v du

---


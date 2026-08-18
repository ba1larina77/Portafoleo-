#include <iostream>

// Función para multiplicar sin usar el operador '*'
// Implementación básica: suma 'a', 'b' veces.
int multiplicar(int a, int b) {
    int resultado = 0;
    bool negativo = false;

    // Manejo de signos
    if (b < 0) {
        b = -b;      // Hacemos b positivo para el bucle
        negativo = true;
    }

    for (int i = 0; i < b; i++) {
        resultado += a;
    }

    return negativo ? -resultado : resultado;
}

int relu(int z) {
    return (z > 0) ? z : 0;
}

int neurona(int* x, int* w, int b, int n) {
    int acumulador = 0;

    for (int i = 0; i < n; i++) {
        // x[i] * w[i] reemplazado por la función de sumas sucesivas
        acumulador += multiplicar(x[i], w[i]);
    }

    acumulador += b;
    return relu(acumulador);
}

int main() {
    int x[] = {3, -2};
    int w[] = {4, 2};
    int b = -2;
    int n = 2;

    std::cout << "Resultado: " << neurona(x, w, b, n) << std::endl;
    return 0;
}
#include <iostream>
#include <vector>

using namespace std;

// Esta es tu función base (usando Horner por eficiencia)
int evaluarPolinomio(const vector<int>& coef, int x) {
    int resultado = 0;
    for (int c : coef) {
        resultado = resultado * x + c;
    }
    return resultado;
}

// Esta función calcula x^n llamando a la anterior
int potencia(int base, int exponente) {
    if (exponente == 0) return 1;

    // Creamos un vector de tamaño exponente + 1
    // Ejemplo: para x^3, necesitamos 4 coeficientes: [1, 0, 0, 0]
    vector<int> coeficientes(exponente + 1, 0); 
    
    // El coeficiente de la potencia más alta debe ser 1
    coeficientes[0] = 1;

    // Llamamos a la función de polinomio
    return evaluarPolinomio(coeficientes, base);
}

int main() {
    int b = 2, e = 5;
    cout << b << " elevado a " << e << " es: " << potencia(b, e) << endl;
    return 0;
}

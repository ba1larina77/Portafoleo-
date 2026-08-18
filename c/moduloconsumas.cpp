#include <iostream>
using namespace std;

// Función que calcula el residuo usando restas
int calcularModulo(int a, int b) {
    // Caso base: no se puede dividir por cero
    if (b == 0) return -1; 

    // Mientras el dividendo sea mayor o igual al divisor
    while (a >= b) {
        a = a - b; // Vamos quitando trozos de tamaño 'b'
    }
    
    // Lo que sobra es el módulo
    return a; 
}

int main() {
    int a, b;
    cout << "Ingrese el dividendo (a): ";
    cin >> a;
    cout << "Ingrese el divisor (b): ";
    cin >> b;

    int resultado = calcularModulo(a, b);

    if (resultado == -1) {
        cout << "Error: Division por cero." << endl;
    } else {
        cout << "El residuo (modulo) es: " << resultado << endl;
    }

    return 0;
}
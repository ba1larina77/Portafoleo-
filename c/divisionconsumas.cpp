#include <iostream>
using namespace std;

int divisionConSumas(int a, int b) {
    if (b == 0) return 0; // Evitar división por cero

    int cociente = 0;
    // Mientras podamos quitarle 'b' a 'a'
    while (a >= b) {
        a -= b;      // Restamos el divisor
        cociente++;  // Contamos cuántas veces pudimos restar
    }
    return cociente;
}

int main() {
    int a, b;
    cout << "Ingrese dividendo y divisor: ";
    cin >> a >> b;

    if (b == 0) {
        cout << "Error: No se puede dividir por cero." << endl;
    } else {
        int resultado = divisionConSumas(a, b);
        cout << "Resultado de la division: " << resultado << endl;
        cout << "Residuo (sobrante): " << a - (resultado * b) << endl; 
    }

    return 0;
}
#include <iostream>
#include <vector>

using namespace std;

// Multiplicación basada en sumas
int multiplicar(int a, int b) {
    int resultado = 0;
    // Manejo básico para evitar bucles infinitos si b es negativo
    bool negativo = b < 0;
    int veces = negativo ? -b : b;
    
    for(int i = 0; i < veces; i++) {
        resultado += a;
    }
    
    return negativo ? -resultado : resultado;
}

// Función Horner recibiendo el tamaño 'n' explícitamente
int evaluarHorner(const vector<int>& coef, int n, int x) {
    // Iniciamos con el primer coeficiente (índice 0)
    int resultado = coef[0]; 

    // El bucle corre hasta el tamaño 'n' especificado por el usuario
    for (int i = 1; i < n; i++) {
        // resultado = (resultado * x) + coeficiente_actual
        resultado = multiplicar(resultado, x) + coef[i];
    }
    return resultado;
}

int main() {
    int n, x;
    cout << "Ingrese el numero de terminos (grado + 1): ";
    if (!(cin >> n) || n <= 0) return 1;

    cout << "Ingrese el valor de X: ";
    cin >> x;

    vector<int> v(n);
    for(int i = 0; i < n; i++) {
        cout << "Coeficiente de x^" << (n - 1 - i) << ": ";
        cin >> v[i];
    }

    // Se envía 'n' como argumento a la función
    cout << "\nEl resultado es: " << evaluarHorner(v, n, x) << endl;

    return 0;
}
#include <iostream>
using namespace std;

int mul(int a, int b){
    for(int i = 0; i < b; i++){
        a += a;
    }
    return a;
}

int main(){
    int a, b;
    cout << "Ingrese dos numeros: ";
    cin >> a >> b;
    mul (a,b);
    cout << "La multiplicacion de " << a << " y " << b << " es: " << a * b << endl;
    return 0;
}

//asi se ejecuta g++ mul.cpp -o mul.exe
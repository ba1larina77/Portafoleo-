#include <iostream>
using namespace std;

int relu(int a){
    if(a > 0){
        return a;
    }
    else{
        return 0;
    }
}

int main(){
    int a;
    cout << "Ingrese un numero: ";
    cin >> a;
    cout << "El resultado de la funcion relu es: " << relu(a) << endl;
    return 0;
}
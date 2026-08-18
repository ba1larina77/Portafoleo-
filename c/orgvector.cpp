#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

void vector1( int v[], int n);

void vector1 (int v[], int n){
    int temp;
    for (int i = 0; i < n -1; i++){
        for(int  j = 0; j < n - 1; j++){
            if(v[j] > v [j+ 1]){
                temp = v[j];
                v[j] = v[j+1];
                v[j+1] = temp;
            }
        }
    }
    for (int i = 0; i < n; i++){
        cout << v[i] << " ";
    }
}

int main() {
    int v[] = {1 , 3 , 5, 6, 7 , 1};
    int n = sizeof(v) / sizeof(v[0]);
    vector1(v, n);
    return 0;
}


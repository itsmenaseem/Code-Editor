const cppDefaultCode = `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`;

const javaDefaultCode = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`;


const pythonDefaultCode = `def main():
    print("Hello, World!")

if __name__ == "__main__":
    main()`;

const defaultCodes = {
        cpp: cppDefaultCode,
        java: javaDefaultCode,
        python: pythonDefaultCode
      };

export default defaultCodes;
/**
 * Example JavaScript file to demonstrate code sharing
 */
function greet(name) {
  return `Hello, ${name}!`;
}

class Calculator {
  add(a, b) {
    return a + b;
  }
  
  subtract(a, b) {
    return a - b;
  }
  
  multiply(a, b) {
    return a * b;
  }
  
  divide(a, b) {
    if (b === 0) {
      throw new Error("Cannot divide by zero");
    }
    return a / b;
  }
}

// Usage example
const calc = new Calculator();
console.log(greet("User"));
console.log(`2 + 3 = ${calc.add(2, 3)}`);
console.log(`5 - 2 = ${calc.subtract(5, 2)}`);
console.log(`4 * 6 = ${calc.multiply(4, 6)}`);
console.log(`10 / 2 = ${calc.divide(10, 2)}`);
export class Matrix {
  public constructor(public data: number[][]) {}

  public add(other: Matrix | number): Matrix {
    if (typeof other === 'number') {
      const result = this.data.map((row) => row.map((val) => val + other));
      return new Matrix(result);
    }
    const result = this.data.map((row, i) =>
      row.map((val, j) => val + other.data[i]![j]!)
    );
    return new Matrix(result);
  }

  public subtract(other: Matrix | number): Matrix {
    if (typeof other === 'number') {
      const result = this.data.map((row) => row.map((val) => val - other));
      return new Matrix(result);
    }
    const result = this.data.map((row, i) =>
      row.map((val, j) => val - other.data[i]![j]!)
    );
    return new Matrix(result);
  }

  public multiply(other: Matrix | number): Matrix {
    if (typeof other === 'number') {
      const result = this.data.map((row) => row.map((val) => val * other));
      return new Matrix(result);
    }
    const result = this.data.map((row, i) =>
      row.map((_, j) =>
        this.data[i]!.reduce((sum, val, k) => sum + val * other.data[k]![j]!, 0)
      )
    );
    return new Matrix(result);
  }

  public divide(other: Matrix | number): Matrix {
    if (typeof other === 'number') {
      const result = this.data.map((row) => row.map((val) => val / other));
      return new Matrix(result);
    }
    const result = this.data.map((row, i) =>
      row.map((val, j) => val / other.data[i]![j]!)
    );
    return new Matrix(result);
  }

  public clone() {
    const result = this.data.map((row) => row.slice());
    return new Matrix(result);
  }

  public get value() {
    return this.data;
  }

  public toString(): string {
    const rows = this.data.map((row) => row.join('\t'));
    if (rows.length === 1) {
      return `⎡ ${rows[0]} ⎤`;
    }
    return rows
      .map((row, i) => {
        if (i === 0) return `⎡ ${row} ⎤`;
        if (i === rows.length - 1) return `⎣ ${row} ⎦`;
        return `⎢ ${row} ⎥`;
      })
      .join('\n');
  }

  public [Symbol.for('nodejs.util.inspect.custom')](): string {
    return this.toString();
  }

  public [Symbol.for('+')](other: Matrix | number): Matrix {
    return this.add(other);
  }

  public [Symbol.for('-')](other: Matrix | number): Matrix {
    return this.subtract(other);
  }

  public [Symbol.for('*')](other: Matrix | number): Matrix {
    return this.multiply(other);
  }

  public [Symbol.for('/')](other: Matrix | number): Matrix {
    return this.divide(other);
  }
}

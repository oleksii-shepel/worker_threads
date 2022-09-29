const {parentPort, workerData} = require("worker_threads");

parentPort.postMessage(getFibonacci(workerData.num))

function getFibonacci(n) {
    let m = BigInt(n);
    if (m == 0n) {
      workerData.result = 0n;
    }
    else if (m <= 2n) {
      workerData.result = 1n;
      
    }
    else {
      let a = BigInt(1), b = BigInt(1);
      for(let i = 3n; i <= m; i++) {
      
        let c = a + b;
        a = b;
        b = c;
      }
    
      workerData.result = b;
    }
    return workerData;
}
function createRequest() {
  var request = null;
  try {
    request = new XMLHttpRequest();
  } catch (ex) {
    console.log("Problema ao inicializar o objeto XmlHttpRequest...");
    try {
      request = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (ex2) {
      console.log("Problema ao inicializar o objeto ActiveXObject (Msxml2)...");
      request = new ActiveXObject("Microsoft.XMLHTTP");
    }
  }

  return request;
}

function calculateImcAPI(person, callback) {
  var req = createRequest();
  if (!req) return null;

  req.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        callback(JSON.parse(this.responseText));
      }
    }
  };
  req.open("POST", "http://localhost:8080/imc/calculate", true);
  req.setRequestHeader("Content-Type", "application/json");
  req.send(
    JSON.stringify({
      weight: person.getWeight(),
      height: person.getHeight(),
    })
  );
}

function tableImcAPI(callback) {
  console.log("Chamando API table");
  var req = createRequest();
  if (!req) return null;

  req.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        console.log(JSON.parse(this.responseText));
        callback(JSON.parse(this.responseText));
      }
    }
  };
  req.open("GET", "http://localhost:8080/imc/table", true);
  req.setRequestHeader("Content-Type", "application/json");
  req.send();
}

function Person(height, weight) {
  if (typeof height !== "number" || isNaN(height))
    throw Error("Height is not valid as a number...");
  if (typeof weight !== "number" || isNaN(weight))
    throw Error("Weight is not valid as a number...");

  this._height = height;
  this._weight = weight;
  this.getHeight = function () {
    return this._height;
  };
  this.getWeight = function () {
    return this._weight;
  };
}

function Dietician(height, weight) {
  Person.call(this, height, weight);
  this.calculateImc = function (callback) {
    calculateImcAPI(this, callback);
  };
}
Dietician.prototype = Object.create(Person.prototype);
Dietician.prototype.constructor = Dietician;

function createDietician(inputHeight, inputWeight) {
  var height = parseFloat(inputHeight);
  var weight = parseFloat(inputWeight);

  return new Dietician(height, weight);
}

function montarTabela() {
  let table = document.createElement("table");
  let thead = document.createElement("thead");
  let tbody = document.createElement("tbody");

  table.appendChild(thead);
  table.appendChild(tbody);

  // Adding the entire table to the body tag
  document.getElementById("tabela").appendChild(table);
  let row_1 = document.createElement("tr");
  let heading_1 = document.createElement("th");
  heading_1.innerHTML = "Peso";
  let heading_2 = document.createElement("th");
  heading_2.innerHTML = "Descrição";

  row_1.appendChild(heading_1);
  row_1.appendChild(heading_2);
  thead.appendChild(row_1);
  return function () {
    console.log("Montando Tabela");
    var valores = tableImcAPI(function (resultado) {
      let i = 0;
      console.log("Tamanho tabela: " + table.rows.length);
      let tabelaSize = table.rows.length;
      let j = 0;
      if (table.rows.length > 1) {
        while (j < tabelaSize -1) {
          document.getElementById("row"+j).remove();
          j++;
        }
      }
      while (i < Object.keys(resultado).length) {
        let indice = Object.keys(resultado)[i];
        let row_2 = document.createElement("tr");
        row_2.setAttribute("id", "row"+i);
        let row_2_data_1 = document.createElement("td");
        row_2_data_1.innerHTML = indice;
        let row_2_data_2 = document.createElement("td");
        row_2_data_2.innerHTML = resultado[indice];
        row_2.appendChild(row_2_data_1);
        row_2.appendChild(row_2_data_2);
        tbody.appendChild(row_2);
        i++;
      }
    });
  };
}

function calculateBuilder() {
  console.log(
    "construindo a minha closure para manipulacao do evento de clique..."
  );
  var heightElem = document.getElementById("height");
  var weightElem = document.getElementById("weight");
  var imcElem = document.getElementById("imc");

  return function () {
    console.log("calculando o IMC utilizando os valores do escopo léxico...");
    var dietician = createDietician(heightElem.value, weightElem.value);
    dietician.calculateImc(function (resultado) {
      imcElem.innerHTML = resultado["imc"];
    });
  };
}

window.onload = function (evt) {
  console.log("carreguei o conteúdo...");
  var btn = document.querySelector("div.form button");
  btn.addEventListener("click", calculateBuilder());
  btn.addEventListener("click", montarTabela());
};

console.log("executei o script...");

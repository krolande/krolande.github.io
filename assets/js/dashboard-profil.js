var deconnexion = document.getElementsByClassName("logout");
deconnexion[0].addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('jwt');
    window.location.href = "login.html";
});

// Obtenir le JWT du stockage local : JWT est pour "Json Web Token"
var jwt = localStorage.getItem('jwt');

recupererDonneesUtilisateur();
// Identification et ratio de base de l’utilisateur
function recupererDonneesUtilisateur() {
    fetch('https://academy.digifemmes.com/api/graphql-engine/v1/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`,  // Définir les en-têtes d’authentification de base avec encodage base64

        },
        body: JSON.stringify({
            query: `
            query{
                user{
                    attrs
                    email
                    campus
                    lastName
                    firstName
                    login
                    totalUp
                    totalDown
                }
            }`,
        }),
    }).then((response) => response.json()).then((data) => {
        AfficheProfil(data);
        AfficheRatio(data);
    }).catch((error) => {
        console.error('La démande a échoué aux infos de base :', error);
    });
}

function miseAjourSVGs() {
    document.getElementById('svg-total-up').innerHTML = '';
    document.getElementById('svg-total-down').innerHTML = '';
    document.getElementById("svg-xp-courbe").innerHTML = '';

    recupererDonneesUtilisateur();
    recupererXPcourbe();
}

window.addEventListener('resize', () =>{
    clearTimeout(window.resizedFinished);
    window.resizedFinished = setTimeout(miseAjourSVGs, 250)
});

//fonction pour afficher le profile des utilisateurs
function AfficheProfil(data = {}) {
    var bienvenue = document.getElementById('bienvenue');
    var username = document.getElementById('username');
    var email = document.getElementById('email');
    var firstname = document.getElementById('firstname');
    var lastname = document.getElementById('lastname');
    var campus = document.getElementById('campus');
    var dropdown_button = document.getElementById('dropdown_button');

    bienvenue.innerHTML = "Bienvenue," + " " + data.data.user[0].firstName + " " + data.data.user[0].lastName + " !";
    username.innerHTML = data.data.user[0].login;
    email.innerHTML = data.data.user[0].email;
    firstname.innerHTML = data.data.user[0].firstName;
    lastname.innerHTML = data.data.user[0].lastName;
    campus.innerHTML = data.data.user[0].campus;
    dropdown_button.innerHTML = data.data.user[0].login;
}

function AfficheRatio(data = {}) {
    document.getElementById('svg-total-up').innerHTML = '';
    document.getElementById('svg-total-down').innerHTML = '';

    var total_fait = document.getElementById('total-up');
    var total_reçu = document.getElementById('total-down');

    // Calculer les proportions non arrondi
    var totalUp = (data.data.user[0].totalUp / 10000) / 100;
    var totalDown = (data.data.user[0].totalDown / 10000) / 100;

    // multiplier par 100000 pour obtenir Mb et l’arrondir à 2 décimales
    total_fait.innerHTML = Math.round(data.data.user[0].totalUp / 10000) / 100 + " " + "Mb";
    total_reçu.innerHTML = Math.round(data.data.user[0].totalDown / 10000) / 100 + " " + "Mb";
    var valeurRatio = document.getElementById('valeur-ratio');
    var ratio = data.data.user[0].totalUp / data.data.user[0].totalDown;
    // arrondir le rapport à 1 décimale
    ratio = Math.round(ratio * 10) / 10;
    // faire apparaître une décimale
    ratio = ratio.toFixed(1);
    valeurRatio.innerHTML = ratio;

    var total = totalUp + totalDown;

    // Définir les dimensions et la position du conteneur SVG
    // la largeur doit être de 50% du conteneur parent mais quand on le met à 50% ça ne marche pas donc on le met à 100% et puis on le divise par 2
    var largeurParent = document.getElementById('infos-ratio').offsetWidth;
    var largeurSvg = largeurParent;
    var hauteurParent = document.getElementById('infos-ratio').offsetHeight;
    var hauteurSvg = hauteurParent / 2;

    // Calculer les coordonnées des lignes
    var y1 = 50 + "%";
    var y2 = 50 + "%";
    var x1 = 0;
    var x2 = (totalUp / total) * largeurSvg;
    var x3 = 0;
    var x4 = (totalDown / total) * hauteurSvg;

    // Créer l’élément SVG
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', largeurSvg);
    svg.setAttribute('height', hauteurSvg);

    var svg2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg2.setAttribute('width', largeurSvg);
    svg2.setAttribute('height', hauteurSvg);

    // Créer la première ligne
    var line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1', x1);
    line1.setAttribute('y1', y1);
    line1.setAttribute('x2', x2);
    line1.setAttribute('y2', y1);
    line1.setAttribute('stroke', '#50C878');
    line1.setAttribute('stroke-width', 10);

    // Créer la deuxième ligne
    var line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', x3);
    line2.setAttribute('y1', y2);
    line2.setAttribute('x2', x4);
    line2.setAttribute('y2', y2);
    line2.setAttribute('stroke', 'blue');
    line2.setAttribute('stroke-width', 10);

    // Ajouter les lignes à l’élément SVG
    svg.appendChild(line1);
    svg2.appendChild(line2);

    // Ajouter l’élément SVG au DOM
    var container = document.getElementById('svg-total-up');
    var container2 = document.getElementById('svg-total-down');
    container.appendChild(svg);
    container2.appendChild(svg2);
}

//Pour recuperer les XP
fetch('https://academy.digifemmes.com/api/graphql-engine/v1/graphql', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({
        query: `
        query  {
            transaction_aggregate(where: {type: {_eq: "xp"}, eventId: {_eq: 32}}) { aggregate { sum { amount } } }
            
        }`,
    }),
}).then(res => res.json()).then(data => {
    AfficherXP(data);
}).catch(err => console.error('demande d affichage de xp échoué:', err));

function AfficherXP(data = {}) {
    var xp = document.getElementById('xp');
    var total_xp = 0;

    //console.log(data.data.transaction_aggregate.aggregate.sum.amount) ;
    // multiplier par 100000 pour obtenir Mb et l’arrondir à 2 décimales
    total_xp = data.data.transaction_aggregate.aggregate.sum.amount;
    xp.innerHTML = "XP : " + total_xp;
}

recupererCompetences();

function recupererCompetences(){
    fetch('https://academy.digifemmes.com/api/graphql-engine/v1/graphql',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({
            query: `
            query {
                user {
                    transactions(where:{
                        type: {_like: "%skill%"}
                    }
                  ) {
                    type
                    amount
                  }
                }
            }
            `,
        }),
    }).then(response => response.json()).then(data => {
        AfficherCompetences(data);
    }).catch(err => console.error('Demande de recuperation de compétences échoué:', err));
}

function AfficherCompetences(data){
      // prog, algo, sys-admin, front, back, stats, game
  var competencesTechnique = {
    "Prog": 0,
    "Algo": 0,
    "Sys-Admin": 0,
    "Front-End": 0,
    "Back-End": 0,
    "Stats": 0,
    "Game": 0
  };
  var competencesLangage = {
    "Go": 0,
    "Js": 0,
    "Rust": 0,
    "Html": 0,
    "Css": 0,
    "Unix": 0,
    "Docker": 0,
    "Sql": 0,
    "C": 0,
    "PHP": 0,
    "Python": 0
  };

  var maxTechnique = 0;
  var maxLangage = 0;

  for (var i = 0; i < data.data.user[0].transactions.length; i++) {
    var competences = data.data.user[0].transactions[i].type;
    var amount = data.data.user[0].transactions[i].amount;

    if (competences.includes("_go") || competences.includes("js") || competences.includes("rust") 
    || competences.includes("html") || competences.includes("css") || competences.includes("unix") 
    || competences.includes("docker") || competences.includes("sql") || competences.includes("_c")
    || competences.includes("PHP") || competences.includes("Python")) {
      if (competences.includes("_go")) {
        competences = "Go";
      } else if (competences.includes("js")) {
        competences = "Js";
      } else if (competences.includes("rust")) {
        competences = "Rust";
      } else if (competences.includes("html")) {
        competences = "Html";
      } else if (competences.includes("css")) {
        competences = "Css";
      } else if (competences.includes("unix")) {
        competences = "Unix";
      } else if (competences.includes("docker")) {
        competences = "Docker";
      } else if (competences.includes("sql")) {
        competences = "Sql";
      } else if (competences.includes("_c")) {
        competences = "C";
      }
      else if (competences.includes("php")) {
        competences = "PHP";
      }else if (competences.includes("python")) {
        competences = "Python";
      }

      if (competencesLangage[competences] == undefined || competencesLangage[competences] < amount) {
        competencesLangage[competences] = amount;
      }
      if (maxLangage < amount) {
        maxLangage = amount;
      }
    } else {// Pour prendre que la plus grande quantité d’xp pour chaque compétence
      if (competences.includes("prog")) {
        competences = "Prog";
      } else if (competences.includes("algo")) {
        competences = "Algo";
      } else if (competences.includes("sys-admin")) {
        competences = "Sys-Admin";
      } else if (competences.includes("front")) {
        competences = "Front-End";
      } else if (competences.includes("back")) {
        competences = "Back-End";
      } else if (competences.includes("stats")) {
        competences = "Stats";
      } else if (competences.includes("game")) {
        competences = "Game";
      }
      if (competencesTechnique[competences] == undefined || competencesTechnique[competences] < amount) {
        competencesTechnique[competences] = amount;
      }
      if (maxTechnique < amount) {
        maxTechnique = amount;
      }
    }
  }

  // Creation des graphiques pour chaque type de compétence (technique et langage). 
  //Les graphiques seront des cercles avec autant de rayon que le nombre de compétences. 
  //Ce rayon sera coché avec la quantité d’XP pour chaque compétence

  document.getElementById("competences-tech").innerHTML = "";
  document.getElementById("competences-langage").innerHTML = "";

  var largeurParentTech = document.getElementById("competences-tech").offsetWidth;
  var hauteurParentTech = document.getElementById("competences-tech").offsetHeight;

  var lagrgeurParentLang = document.getElementById("competences-langage").offsetWidth;
  var hauteurParentLang = document.getElementById("competences-langage").offsetHeight;

  var svgTech = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgTech.setAttribute("width", largeurParentTech);
  svgTech.setAttribute("height", hauteurParentTech);
  svgTech.setAttribute("viewBox", `0 0 ${largeurParentTech} ${hauteurParentTech}`);

  var cercleCompTech = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  cercleCompTech.setAttribute("cx", largeurParentTech / 2); // cx and cy are the coordinates of the center of the circle
  cercleCompTech.setAttribute("cy", hauteurParentTech / 2);
  cercleCompTech.setAttribute("r", largeurParentTech / 3 - 10); // r is the radius of the circle
  cercleCompTech.setAttribute("fill", "none");
  cercleCompTech.setAttribute("stroke", "white");
  cercleCompTech.setAttribute("stroke-width", 3);
  svgTech.appendChild(cercleCompTech);

  // Nombre de compétences
  var nombreTechRayon = Object.keys(competencesTechnique).length;
  var angleTech = 360 / nombreTechRayon;
  var longueurRayon = (largeurParentTech / 3 -10);
  var anglePrecedent = 0 - angleTech;

  // dessiner un rayon pour chaque compétence
  for (var key in competencesTechnique) {
    var rayon = document.createElementNS("http://www.w3.org/2000/svg", "line");
    rayon.setAttribute("x1", largeurParentTech / 2);
    rayon.setAttribute("y1", hauteurParentTech / 2);
    rayon.setAttribute("x2", largeurParentTech / 2);
    rayon.setAttribute("y2", hauteurParentTech / 2 - largeurParentTech / 3 + 10);
    rayon.setAttribute("stroke", "white");
    rayon.setAttribute("stroke-width", 1);
    rayon.setAttribute("transform", `rotate(${anglePrecedent}, ${largeurParentTech / 2}, ${hauteurParentTech / 2})`);
    svgTech.appendChild(rayon);
    anglePrecedent += angleTech;

    // placer les ticks sur le rayon
    var precedentX = largeurParentTech / 2;
    var precedentY = hauteurParentTech / 2;
    var radPart = longueurRayon / 8;

    for (var i = 0; i < 10; i++) {
      var ticks = document.createElementNS("http://www.w3.org/2000/svg", "line");
      ticks.setAttribute("x1", precedentX - 3);
      ticks.setAttribute("y1", precedentY);
      ticks.setAttribute("x2", precedentX + 3);
      ticks.setAttribute("y2", precedentY);
      ticks.setAttribute("stroke", "white");
      ticks.setAttribute("stroke-width", 1);
      ticks.setAttribute("transform", `rotate(${anglePrecedent}, ${largeurParentTech / 2}, ${hauteurParentTech / 2})`);
      // faire tourner les ticks à 90°

      svgTech.appendChild(ticks);

      precedentY -= radPart;

    }

    //place la quantité d’xp sur les ticks
    var pourcentageRad = longueurRayon / 100;
    var amount = competencesTechnique[key];
    if (competencesTechnique[Object.keys(competencesTechnique)[Object.keys(competencesTechnique).indexOf(key) + 1]] == undefined) {
      var nextamount = competencesTechnique[Object.keys(competencesTechnique)[0]];
    } else {
    var nextamount = competencesTechnique[Object.keys(competencesTechnique)[Object.keys(competencesTechnique).indexOf(key) + 1]];
    }
    console.log("nextamount : " + nextamount);

    var amountTicks = document.createElementNS("http://www.w3.org/2000/svg", "line");
    amountTicks.setAttribute("x1", precedentX - 3);
    amountTicks.setAttribute("y1", hauteurParentTech / 2 - pourcentageRad * amount);
    amountTicks.setAttribute("x2", precedentX + 3);
    amountTicks.setAttribute("y2", hauteurParentTech / 2 - pourcentageRad * amount);
    amountTicks.setAttribute("stroke", "#235BA8");
    amountTicks.setAttribute("stroke-width", 3);
    amountTicks.setAttribute("transform", `rotate(${anglePrecedent}, ${largeurParentTech / 2}, ${hauteurParentTech / 2})`);
    svgTech.appendChild(amountTicks);

    var a = nextamount;
    console.log("a : " + a);
    var b = amount;
    console.log("b : " + b);
    var c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2) - 2*(a)*(b)*Math.cos(angleTech*(Math.PI/180)));
    console.log("c : " + c);
    var angleA = Math.acos((Math.pow(b, 2) + Math.pow(c, 2) - Math.pow(a, 2))/(2*b*c))*(180/Math.PI);
    var angleB = Math.acos((Math.pow(a, 2) + Math.pow(c, 2) - Math.pow(b, 2))/(2*a*c))*(180/Math.PI);
    var angleC = Math.acos((Math.pow(a, 2) + Math.pow(b, 2) - Math.pow(c, 2))/(2*a*b))*(180/Math.PI);
    console.log("angleA : " + angleA); // 27.82
    console.log("angleB : " + angleB); // 100.75
    console.log("angleC : " + angleC); // 51.42857142857143

    var dotX = precedentX;
    var dotY = hauteurParentTech / 2 - pourcentageRad * amount;

    // hauteur du triangle entre l’angle B le point en b où il forme un angle droit
    // p sera la moitié du périmètre du triangle

    
    // calculer la distance entre le point B et la base de la hauteur du triangle
    var angle_b = 180 - 90 - angleA;
    var distanceY = (Math.sin(angle_b*(Math.PI/180)) * c)/Math.sin(90*(Math.PI/180));
    //var distanceY = 56.30
    console.log("distanceY : " + distanceY);

    var distanceX = (Math.sin(angleA*(Math.PI/180)) * c)/ Math.sin(90*(Math.PI/180));
    //var distanceX = 29.71
    console.log("distanceX : " + distanceX);
    
    // retablir le rapport entre les distances et la longueur du rayon
    distanceX = distanceX * pourcentageRad;
    distanceY = distanceY * pourcentageRad;

    console.log("distanceX : " + distanceX);
    console.log("distanceY : " + distanceY);


    var nextDotX = dotX + distanceX;
    var nextDotY = dotY + distanceY;

    var centerX = largeurParentTech / 2;
    var centerY = hauteurParentTech / 2;

    var polygone = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygone.setAttribute("points", `${dotX},${dotY} ${centerX},${centerY} ${nextDotX},${nextDotY}`);
    polygone.setAttribute("fill", "#235BA8");
    polygone.setAttribute("stroke", "#235BA8");
    polygone.setAttribute("stroke-width", 3);
    polygone.setAttribute("transform", `rotate(${anglePrecedent}, ${largeurParentTech / 2}, ${hauteurParentTech / 2})`);
    svgTech.appendChild(polygone);

    
    // placer le nom du technicien à la fin du rayon, à l’extérieur du cercle, mais faire pivoter le texte pour qu’il soit horizontal
    var nomTech = document.createElementNS("http://www.w3.org/2000/svg", "text");
    nomTech.setAttribute("x", precedentX - 20);
    nomTech.setAttribute("y", precedentY -15);
    nomTech.setAttribute("fill", "white");
    nomTech.setAttribute("font-size", 12);
    nomTech.setAttribute("transform", `rotate(${anglePrecedent}, ${largeurParentTech / 2}, ${hauteurParentTech / 2})`);
    nomTech.textContent = key;
    svgTech.appendChild(nomTech);

    
  }


  var svgLang = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgLang.setAttribute("width", lagrgeurParentLang);
  svgLang.setAttribute("height", hauteurParentLang);
  svgLang.setAttribute("viewBox", `0 0 ${lagrgeurParentLang} ${hauteurParentLang}`);

  var cercleLang = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  cercleLang.setAttribute("cx", lagrgeurParentLang / 2); // cx and cy are the coordinates of the center of the circle
  cercleLang.setAttribute("cy", hauteurParentLang / 2);
  cercleLang.setAttribute("r", lagrgeurParentLang / 3 - 10); // r is the radius of the circle
  cercleLang.setAttribute("fill", "none");
  cercleLang.setAttribute("stroke", "white");
  cercleLang.setAttribute("stroke-width", 3);
  svgLang.appendChild(cercleLang);

  var nombreRayonLang = Object.keys(competencesLangage).length;
  var angleLang = 360 / nombreRayonLang;
  var radiusLang = lagrgeurParentLang / 3 - 10;
  var anglePrecedentLang = 0 - angleLang;

  for (var key in competencesLangage) {
    var rayonLang = document.createElementNS("http://www.w3.org/2000/svg", "line");
    rayonLang.setAttribute("x1", lagrgeurParentLang / 2);
    rayonLang.setAttribute("y1", hauteurParentLang / 2);
    rayonLang.setAttribute("x2", lagrgeurParentLang / 2);
    rayonLang.setAttribute("y2", hauteurParentLang / 2 - lagrgeurParentLang / 3 + 10);
    rayonLang.setAttribute("stroke", "white");
    rayonLang.setAttribute("stroke-width", 1);
    rayonLang.setAttribute("transform", `rotate(${anglePrecedentLang}, ${lagrgeurParentLang / 2}, ${hauteurParentLang / 2})`);
    svgLang.appendChild(rayonLang);

    anglePrecedentLang += angleLang;

    var precedentXLang = lagrgeurParentLang / 2;
    var precedentYLang = hauteurParentLang / 2;
    var radPartLang = radiusLang / 8;

    for (var i = 0; i < 10; i++) {
      var ticksLang = document.createElementNS("http://www.w3.org/2000/svg", "line");
      ticksLang.setAttribute("x1", precedentXLang - 3);
      ticksLang.setAttribute("y1", precedentYLang);
      ticksLang.setAttribute("x2", precedentXLang + 3);
      ticksLang.setAttribute("y2", precedentYLang);
      ticksLang.setAttribute("stroke", "white");
      ticksLang.setAttribute("stroke-width", 1);
      ticksLang.setAttribute("transform", `rotate(${anglePrecedentLang}, ${lagrgeurParentLang / 2}, ${hauteurParentLang / 2})`);
      svgLang.appendChild(ticksLang);

      precedentYLang -= radPartLang;
    }

    var pourcentageRadLang = radiusLang / 100;
    var amountLang = competencesLangage[key];
    if (competencesLangage[Object.keys(competencesLangage)[Object.keys(competencesLangage).indexOf(key)+ 1]] == undefined) {
      var montantSuivantLang = competencesLangage[Object.keys(competencesLangage)[0]];
    } else {
      var montantSuivantLang = competencesLangage[Object.keys(competencesLangage)[Object.keys(competencesLangage).indexOf(key)+ 1]];
    }

    var montantTicksLang = document.createElementNS("http://www.w3.org/2000/svg", "line");
    montantTicksLang.setAttribute("x1", precedentXLang - 3);
    montantTicksLang.setAttribute("y1", hauteurParentLang / 2 - amountLang * pourcentageRadLang);
    montantTicksLang.setAttribute("x2", precedentXLang + 3);
    montantTicksLang.setAttribute("y2", hauteurParentLang / 2 - amountLang * pourcentageRadLang);
    montantTicksLang.setAttribute("stroke", "#235BA8");
    montantTicksLang.setAttribute("stroke-width", 3);
    montantTicksLang.setAttribute("transform", `rotate(${anglePrecedentLang}, ${lagrgeurParentLang / 2}, ${hauteurParentLang / 2})`);
    svgLang.appendChild(montantTicksLang);

    var a = montantSuivantLang;
    var b = amountLang;
    var c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2) - 2 * (a) * (b) * Math.cos(angleLang * (Math.PI / 180)));
    var angleA = Math.acos((Math.pow(b, 2) + Math.pow(c, 2) - Math.pow(a, 2))/(2*b*c))*(180/Math.PI);

    var dotXLang = precedentXLang;
    var dotYLang = hauteurParentLang / 2 - amountLang * pourcentageRadLang;

    var angle_b = 180 - 90 - angleA;
    var distanceYLang = (Math.sin(angle_b*(Math.PI/180)) * c)/Math.sin(90*(Math.PI/180));
    var distanceXLang = (Math.sin(angleA*(Math.PI/180)) * c)/Math.sin(90*(Math.PI/180));

    distanceXLang = distanceXLang * pourcentageRadLang;
    distanceYLang = distanceYLang * pourcentageRadLang; 

    var nextDotXLang = dotXLang + distanceXLang;
    var nextDotYLang = dotYLang + distanceYLang;
    
    var centerXLang = lagrgeurParentLang / 2;
    var centerYLang = hauteurParentLang / 2;

    var polygonLang = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygonLang.setAttribute("points", `${centerXLang},${centerYLang} ${dotXLang},${dotYLang} ${nextDotXLang},${nextDotYLang}`);
    polygonLang.setAttribute("fill", "#235BA8");
    polygonLang.setAttribute("stroke", "#235BA8");
    polygonLang.setAttribute("stroke-width", 3);
    polygonLang.setAttribute("transform", `rotate(${anglePrecedentLang}, ${lagrgeurParentLang / 2}, ${hauteurParentLang / 2})`);
    svgLang.appendChild(polygonLang);

    var textLang = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textLang.setAttribute("x", precedentXLang - 20);
    textLang.setAttribute("y", precedentYLang - 15);
    textLang.setAttribute("fill", "white");
    textLang.setAttribute("font-size", 12);
    textLang.setAttribute("transform", `rotate(${anglePrecedentLang}, ${lagrgeurParentLang / 2}, ${hauteurParentLang / 2})`);
    textLang.innerHTML = key;
    svgLang.appendChild(textLang);
    
  }

  var techContainer = document.getElementById("competences-tech");
  techContainer.appendChild(svgTech);

  var langContainer = document.getElementById("competences-langage");
  langContainer.appendChild(svgLang);


  console.log(competencesTechnique);
  console.log(competencesLangage);
}

/* -------------------------------------------------------------------------------------------- */

// For XP curve
recupererXPcourbe();
function recupererXPcourbe() {
  fetch('https://academy.digifemmes.com/api/graphql-engine/v1/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Set Basic authentication headers with base64 encoding
      'Authorization': `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      query: `
        query  {
          user {
            transactions(where: {
              _and: [
                { object: { progresses: { isDone: { _eq: true } } } }
                {
                  _and: [
                    { path: { _ilike: "%div-01%" } }
                    { path: { _nilike: "%div-01/piscine-js/%" } }
                    { path: { _nilike: "%div-01/piscine-rust/%" } }
                  ]
                }
                { type: { _eq: "xp" } }
              ]
            }, order_by: { createdAt: asc }) {
              path
              amount
              createdAt
              object {
                name
                type
              }
            }
          }
          }
        `,
    }),
  })
    .then(res => res.json())
    .then(data => {
      var xp_total = 0;
      for (var i = 0; i < data.data.user[0].transactions.length; i++) {
        xp_total += data.data.user[0].transactions[i].amount;
      }

      clean_XP_data(data);
    })
    .catch(err => console.error('Introspection failed at XP:', err));
}
function clean_XP_data(data = {}) {

  var xp_object = [];
  // créer un objet avec le nom, la date et la quantité de xp
  for (var i = 0; i < data.data.user[0].transactions.length; i++) {
    var name = data.data.user[0].transactions[i].object.name;
    var date = new Date(data.data.user[0].transactions[i].createdAt);
    // convertir la date au format "2023-07-10"
    date = date.toISOString().slice(0, 10);
    var amount = data.data.user[0].transactions[i].amount;
    var path = data.data.user[0].transactions[i].path;
    // vérifier si le xp est un float ou un int
    xp_object.push({ name: name, date: date, amount: amount, path: path });
  }

  var xp_object_clean = [];

  for (var item of xp_object) {
    if (item.path.includes('checkpoint')) {
      xp_object_clean.push({
        name: item.name,
        date: item.date,
        amount: item.amount,
        createdAt: item.createdAt
      });
    } else {
      var existingItemIndex = xp_object_clean.findIndex(existingItem => existingItem.name === item.name);
      if (existingItemIndex !== -1) {
        if (item.amount > xp_object_clean[existingItemIndex].amount) {
          xp_object_clean[existingItemIndex].amount = item.amount;
        }
      } else {
        xp_object_clean.push({
          name: item.name,
          date: item.date,
          amount: item.amount,
          createdAt: item.createdAt
        });
      }
    }
  }
  // xp total
  var xp_total = 0;
  for (var i = 0; i < xp_object_clean.length; i++) {
    xp_total += xp_object_clean[i].amount;
  }

  AfficherXPcourbe(xp_object_clean);
}


// Cette fonction affiche la courbe XP. La courbe représente l’évolution de l’XP accumulée au fil du temps.
function AfficherXPcourbe(data = {}) {
  document.getElementById("svg-xp-courbe").innerHTML = "";

  var parentWidth = document.getElementById('svg-xp-courbe').clientWidth;
  var svgWidth = parentWidth;
  var parentHeight = document.getElementById('svg-xp-courbe').clientHeight;
  var svgHeight = parentHeight;

  // dessiner les deux axes du graphique : un pour les mois et un pour le xp
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", svgWidth);
  svg.setAttribute("height", svgHeight);
  svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

   // dessiner l’axe des x
  var xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  xAxis.setAttribute("x1", 60);
  xAxis.setAttribute("y1", svgHeight - 60);
  xAxis.setAttribute("x2", svgWidth);
  xAxis.setAttribute("y2", svgHeight - 60);
  xAxis.setAttribute("stroke", "white");
  xAxis.setAttribute("stroke-width", 3);
  svg.appendChild(xAxis);

   // dessiner l’axe des y
  var yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  yAxis.setAttribute("x1", 60);
  yAxis.setAttribute("y1", 0);
  yAxis.setAttribute("x2", 60);
  yAxis.setAttribute("y2", svgHeight - 60);
  yAxis.setAttribute("stroke", "white");
  yAxis.setAttribute("stroke-width", 3);
  svg.appendChild(yAxis);

  // draw the x axis labels
  var xLabels = document.createElementNS("http://www.w3.org/2000/svg", "g");
  xLabels.setAttribute("class", "xLabels");
  svg.appendChild(xLabels);

  // draw the y axis labels
  var yLabels = document.createElementNS("http://www.w3.org/2000/svg", "g");
  yLabels.setAttribute("class", "yLabels");
  svg.appendChild(yLabels);


// tirer les ticks de l’axe des x. chaque ticks sera un mois. De juin 2022 à juin 2024
  //var mois = ["juin 2022", "juillet", "août", "septembre", "octobre", "novembre", "décembre", "janvier 2023", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre", "janvier 2024", "février", "mars", "mai", juin"];
  // même que ci-dessus mais au format "2023-07"
  var months = ["2022-06", "2022-07", "2022-08", "2022-09", "2022-10", "2022-11", "2022-12", "2023-01", "2023-02", "2023-03", "2023-04", "2023-05", "2023-06", "2023-07", "2023-08", "2023-09", "2023-10", "2023-11", "2023-12", "2024-01", "2024-02", "2024-03", "2024-04", "2024-05", "2024-06", "", ""];
  var xTicks = document.createElementNS("http://www.w3.org/2000/svg", "g");
  xTicks.setAttribute("class", "xTicks");
  svg.appendChild(xTicks);

  for (var i = 0; i < months.length; i++) {

    // dessiner les ticks de l’axe x
    var xTick = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xTick.setAttribute("x1", 60 + (svgWidth - 60) / months.length * i);
    xTick.setAttribute("y1", 0);
    xTick.setAttribute("x2", 60 + (svgWidth - 60) / months.length * i);
    xTick.setAttribute("y2", svgHeight - 55);
    xTick.setAttribute("stroke", "rgba(255, 255, 255, 0.5)");
    xTick.setAttribute("stroke-width", 1);
    xTicks.appendChild(xTick);

     // dessiner les étiquettes de l’axe des x (mois)
    var xTickText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    xTickText.setAttribute("x", 60 + (svgWidth - 30) / months.length * i);
    xTickText.setAttribute("y", svgHeight - 50);
    xTickText.setAttribute("font-size", 10);
    xTickText.setAttribute("font-family", "sans-serif");
    xTickText.setAttribute("fill", "white");
    xTickText.setAttribute("text-anchor", "start"); // 
    // Faire pivoter chaque étiquette de 45 degrés
    xTickText.setAttribute("transform", "rotate(45 " + (60 + (svgWidth - 30) / months.length * i) + "," + (svgHeight - 50) + ")");
    xTickText.textContent = months[i];
    xTicks.appendChild(xTickText);

  }

  // dessiner les ticks de l’axe y. chaque ticks sera une quantité d’xp. De 0 à 2 millions. Un tick tous les 100k
  var xpTicks = ["0", "100k", "200k", "300k", "400k", "500k", "600k", "700k", "800k", "900k", "1M", "1.1M", "1.2M", "1.3M", "1.4M", "1.5M", "1.6M", "1.7M", "1.8M", "1.9M", "2M"];
  var yTicks = document.createElementNS("http://www.w3.org/2000/svg", "g");
  yTicks.setAttribute("class", "yTicks");
  svg.appendChild(yTicks);

  for (var i = 0; i < xpTicks.length; i++) {
    // dessiner les ticks de l’axe y
    var yTick = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yTick.setAttribute("x1", 55);
    yTick.setAttribute("y1", svgHeight - 60 - (svgHeight - 60) / xpTicks.length * i);
    yTick.setAttribute("x2", svgWidth);
    yTick.setAttribute("y2", svgHeight - 60 - (svgHeight - 60) / xpTicks.length * i);
    yTick.setAttribute("stroke", "rgba(255, 255, 255, 0.2)");
    yTick.setAttribute("stroke-width", 1);
    yTicks.appendChild(yTick);

    // dessiner les étiquettes de l’axe y (xp)
    var yTickText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    yTickText.setAttribute("x", 50);
    yTickText.setAttribute("y", svgHeight - 60 - (svgHeight - 60) / xpTicks.length * i);
    yTickText.setAttribute("font-size", 10);
    yTickText.setAttribute("font-family", "sans-serif");
    yTickText.setAttribute("fill", "#235BA8");
    yTickText.setAttribute("text-anchor", "end");
    yTickText.textContent = xpTicks[i];
    yTicks.appendChild(yTickText);

  }

  // dessiner la courbe xp
  // la courbe sera des lignes de frein. chaque point sera aligné avec le mois et le montant exact d’xp

  var previousY = 0;

  for (var i = 0; i < data.length; i++) {
    var xpCurve = document.createElementNS("http://www.w3.org/2000/svg", "path");
    //ne prendre que le mois et l’année à compter de la date
    var month = data[i].date.substring(0, 7);
    var xp = data[i].amount;

    previousY += xp;


    var xpScale = (svgHeight - 60) / 2100000;
    // obtenir les coordonnées x et y du point
    // aligner le point avec le mois
    for (var j = 0; j < months.length; j++) {
      if (month == months[j]) {
        var x = 60 + (svgWidth - 60) / months.length * j;

      }
    }

    var y = svgHeight - 60 - previousY * xpScale;

    // dessiner le point
    // même que ci-dessus mais avec croix
    var point = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var cross = "M" + (x - 2) + " " + (y - 2) + "L" + (x + 2) + " " + (y + 2) + "M" + (x + 2) + " " + (y - 2) + "L" + (x - 2) + " " + (y + 2);
    point.setAttribute("d", cross);
    point.setAttribute("stroke", "#");
    point.setAttribute("stroke-width", 1);
    svg.appendChild(point);


    // tracer la ligne
    if (i == 0) {
      var path = "M" + x + " " + y;
    }
    else {
      path += "L" + x + " " + y;
    }
    xpCurve.setAttribute("d", path); // d est l’attribut qui définit le chemin de la courbe (M = déplacer vers, L = ligne vers)
    xpCurve.setAttribute("stroke", "white");
    xpCurve.setAttribute("stroke-width", 1);
    xpCurve.setAttribute("fill", "#235BA8");
    //faire en sorte que les lignes soient derrière les points

    svg.appendChild(xpCurve);

  }


  var container = document.getElementById("svg-xp-courbe");
  container.appendChild(svg);

}

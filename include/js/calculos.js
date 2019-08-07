function getCustomizedPerfilMensal(idPerfilMensal, i){
    
    if(idPerfilMensal>=0 && idPerfilMensal<3){
        return perfil_mensal[idPerfilMensal].tabela[i].valor;
    }else{
        return new Number($('#perfil-mensal-input' + (i + 1) ).val())/100;
    }
}

function totalNecessidadesEnergiaFunction() {
    var idPerfilMensal = new Number($('#perfil-mensal').val());
    var idPerfilSemanal = new Number($('#perfil-semanal').val());
    var tmpReq = new Number($("#temp-req").val());
    var idDistrito = new Number($('#distrito').val());
    necessidades_mes = [];
    totalNecessidadesEnergia = 0;
    total = 0;

    for(i=0;i<meses_numero_horas.length; i++){
        var calculos = 0;
        for(j=1;j<rowId+1;j++){
            var inputValue = new Number($('#tipo-consumo-value' + j).val());
            var idLocal = $('#tipo-consumo' + j).val();
            calculos += inputValue * consumo_diario_agua[idLocal].valor;
        }

        var perfilVal = 0;

        if (idPerfilSemanal >= 0 && idPerfilSemanal < 3 ) {
            perfilVal = perfil_semanal[idPerfilSemanal].valor;
         
        } else if (idPerfilSemanal == 3) {
            
            var soma = 0;
            for(k=1;k<8;k++){
                soma += new Number($('#perfil-semanal-input'+k).val());
            }
            perfilVal = (soma/7)/100;
        }
        necessidades_mes[i] = calculos * (getCustomizedPerfilMensal(idPerfilMensal, i) * perfilVal) * meses_numero_horas[i].n_dias * (tmpReq - irradiacao_temp_amb_temp_agua[idDistrito].mesI[i].valorTempAgua) * fatores_conversao[0];
        totalNecessidadesEnergia += new Number(necessidades_mes[i]);
    }

    total = totalNecessidadesEnergia;
    correcaoOrientacao();
    energiaSolarCaptada();
}

function correcaoOrientacao() {
    var orientacaoInput = $('#orientacao-input').val();

    var correcaoOrientacao = 0;

    if(orientacaoInput > 70) {
        correcaoOrientacao = 0;
    } else if(orientacaoInput > 0) {
        correcaoOrientacao = 1.14 - 0.0085 * orientacaoInput;
    }else{
        correcaoOrientacao = 1;
    }

    totalCorrecaoOrientacao = correcaoOrientacao;
}

function getCorrecaoInclinacao(latitude, i){
    for(j=0;j<correcao_inclinacao.length;j++){
        if(latitude==correcao_inclinacao[j].latitude){
            return correcao_inclinacao[j].meses[i].valor;
        }
    }
}

function energiaSolarCaptada() {
    var idDistrito = new Number($('#distrito').val());
    var distritoLatitude = new Number($('#distrito-latitude').val());

    totalEnergiaArray = [];
    totalEnergia = 0;

    for(i=0; i<meses_numero_horas.length;i++){
        
        totalEnergiaArray[i] = (((rendimento_otico * perdas[1].valor) - (coeficient_perdas * ((temperatura_utilizacao_alto - (irradiacao_temp_amb_temp_agua[idDistrito].mesI[i].valorTempAmb + irradiacao_temp_amb_temp_agua[idDistrito].mesI[i].valorTempAgua)) / ((getCorrecaoInclinacao(distritoLatitude, i)) * ((totalCorrecaoOrientacao * perdas[2].valor) * irradiacao_temp_amb_temp_agua[idDistrito].mesI[i].valorIrr) * (fatores_conversao[1] * 1000 / meses_numero_horas[i].n_horas_sol))))) * ((getCorrecaoInclinacao(distritoLatitude, i)) * ((totalCorrecaoOrientacao * perdas[2].valor) * irradiacao_temp_amb_temp_agua[idDistrito].mesI[i].valorIrr))) * (1 - perdas[0].valor) * meses_numero_horas[i].n_dias;
        totalEnergia += new Number(totalEnergiaArray[i]);
    }

    racio();
    energiaSolarCaptada2();
    energiaSolarUtilizada();
    energiaSolarUtilizadaPercent();
    energiaBackup();
    energiaBackupPercent();
    excedenteSolar();
    excedenteSolarPerc();
    necessidadesEnergeticaskWh();
    cenarioI();
    cenarioF();
    reduction();
    var result = resume();
    if(result==1){
        nextStep();
    }
}

function racio() {
    totalRacio = media(necessidades_mes)/media(totalEnergiaArray);
}

function media(el){
    
       var media=0;
    for(i=0;i<el.length;i++){
        if(i>=4 && i<9){
        media += new Number(el[i]);}
    }
    return media/5;
}

function energiaSolarCaptada2() {
    var coletores_reanalise = $('#coletores-reanalise').val();

    totalEnergiaArray2 = [];
    totalEnergia2 = 0;

    for (i = 0; i < meses_numero_horas.length; i++) { 

        if (coletores_reanalise == '' || coletores_reanalise == undefined) {
            totalEnergiaArray2[i] = totalEnergiaArray[i] * new Number((totalRacio / 2.25).toFixed(0)) * 2.25;
        } else {
            totalEnergiaArray2[i] = totalEnergiaArray[i] * coletores_reanalise*2.25;
        }
                totalEnergia2 += totalEnergiaArray2[i];
    }
}

function energiaSolarUtilizada() {

    totalEnergiaSolarUtilizada = [];
    totalEnergiaSolar = 0;

    for (i = 0; i < meses_numero_horas.length; i++) {
        if (totalEnergiaArray2[i] > necessidades_mes[i]){
            totalEnergiaSolarUtilizada[i] = necessidades_mes[i];
        }else{
            totalEnergiaSolarUtilizada[i] = totalEnergiaArray2[i];
        }
                totalEnergiaSolar += totalEnergiaSolarUtilizada[i];
    }
}

function energiaSolarUtilizadaPercent() {

    totalEnergiaSolarUtilizadaPerc = [];
    totalEnergiaSolarPerc = 0;

    for (i = 0; i < meses_numero_horas.length; i++) {
        totalEnergiaSolarUtilizadaPerc[i] = totalEnergiaSolarUtilizada[i] / necessidades_mes[i];
    }
    totalEnergiaSolarPerc = totalEnergiaSolar / total;
}

function energiaBackup() {
    
    var inputRendimento = ($("#rend").val() == 2) ? $('#iRendMan').val() : $("#rend").val();
    var sist_aqs = $("#sis_prod").val();
    var age = $("#age").val();
    var rendFinal = 0;

    totalEnergiaBackupMes = [];
    totalEnergiaBackup = 0;

     if (inputRendimento == 1 && sistemas_prod_aqs[sist_aqs].rendimento[age].nome == idades[age]) {
        rendFinal = sistemas_prod_aqs[sist_aqs].rendimento[age].valor;
    } else if(sist_aqs!="" && sist_aqs!=undefined && sist_aqs==0 && $("#rend").val()==2){
        rendFinal = inputRendimento;
    }else{
        rendFinal = inputRendimento/100;
    }

    for (i = 0; i < meses_numero_horas.length; i++) {
        if (necessidades_mes[i]-totalEnergiaArray2[i] < 0) {
            totalEnergiaBackupMes[i] = 0;
        } else {
            totalEnergiaBackupMes[i] = (necessidades_mes[i] - totalEnergiaArray2[i])/rendFinal;
        }
        totalEnergiaBackup += totalEnergiaBackupMes[i];
    }
}

function energiaBackupPercent() {

    totalEnergiaBackupMesPerc = [];
    totalEnergiaBackupPerc = 0;

    for (i = 0; i < meses_numero_horas.length; i++) {
        totalEnergiaBackupMesPerc[i] = totalEnergiaBackupMes[i] / necessidades_mes[i];
    }
    totalEnergiaBackupPerc = totalEnergiaBackup / total;
}

function excedenteSolar() {

    totalExcedenteSolarArray = [];
    totalExcedenteSolar = 0;

    for (i = 0; i < meses_numero_horas.length; i++) {       

        totalExcedenteSolarArray[i] = totalEnergiaArray2[i] - totalEnergiaSolarUtilizada[i];
        totalExcedenteSolar += totalExcedenteSolarArray[i];
    }
}

function excedenteSolarPerc() {

    totalExcedenteSolarArrayPerc = [];
    totalExcedenteSolarPerc = 0;

    for (i = 0; i < meses_numero_horas.length; i++) {
        totalExcedenteSolarArrayPerc[i] = totalExcedenteSolarArray[i] / totalEnergiaArray2[i];
    }
    totalExcedenteSolarPerc = totalExcedenteSolar/totalEnergia2;
}

function necessidadesEnergeticaskWh(){
    necessidades_mes_kWh = [];
    total_mes_kWh = 0;

    for (i = 0; i < meses_numero_horas.length; i++) {
        necessidades_mes_kWh[i] = necessidades_mes[i] * fatores_conversao[1];
        total_mes_kWh += necessidades_mes_kWh[i];
    }
}

function cenarioI() {
    var inputRendimento = ($("#rend").val() == 2) ? $('#iRendMan').val() : $("#rend").val();
    var sist_aqs = $("#sis_prod").val();
    var age = $("#age").val();
    var custosUnit = $("#custo-unit-input").val();
    var rendCenarioI = 0;

    cenarioI_mes = [];
    cenarioI_custos = [];
    total_cenarioI_mes = 0;
    total_cenarioI_custos = 0;

    if (inputRendimento == 1 && sistemas_prod_aqs[sist_aqs].rendimento[age].nome == idades[age]) {
        rendCenarioI = sistemas_prod_aqs[sist_aqs].rendimento[age].valor;
    } else if(sist_aqs!="" && sist_aqs!=undefined && sist_aqs==0 && $("#rend").val()==2){
        rendCenarioI = inputRendimento;
    }else{
        rendCenarioI = inputRendimento/100;
    }

    for (i = 0; i < meses_numero_horas.length; i++) {

        cenarioI_mes[i] = necessidades_mes_kWh[i] / rendCenarioI;
        cenarioI_custos[i] = cenarioI_mes[i] * custosUnit / sistemas_prod_aqs[sist_aqs].fator_conversao;
        total_cenarioI_mes += cenarioI_mes[i];
        total_cenarioI_custos += cenarioI_custos[i];
    }
    total_cenarioI_custos = total_cenarioI_custos;
}

function cenarioF() {

    var custosUnit = $("#custo-unit-input").val();
    var sist_aqs = $("#sis_prod").val();
    cenarioF_mes = [];
    total_cenarioF_mes = 0;
    cenarioF_custos = [];
    total_cenarioF_custos = 0;

    for (i = 0; i < meses_numero_horas.length; i++) {

        cenarioF_mes[i] = totalEnergiaBackupMes[i] * fatores_conversao[1];
        total_cenarioF_mes += cenarioF_mes[i];
        cenarioF_custos[i] = cenarioF_mes[i] * custosUnit / sistemas_prod_aqs[sist_aqs].fator_conversao;
        total_cenarioF_custos += cenarioF_custos[i];
    }
    total_cenarioF_custos = total_cenarioF_custos;
}

function reduction(){
    reducao_mes = [];
    total_reducao_mes = 0;
    reducao_percent=[];
    total_reduca_percent = 0;

    for (i = 0; i < meses_numero_horas.length; i++) {

        reducao_mes[i] = cenarioI_custos[i]-cenarioF_custos[i];
        total_reducao_mes += reducao_mes[i];
        reducao_percent[i] = reducao_mes[i] / cenarioI_custos[i];
    }
    total_reduca_percent = total_reducao_mes/total_cenarioI_custos;
}

function resume(){

    n_colectores = 0;
    area_colectores = 0;
    volume_acumulacao_resume = 0;
    necess_ener_anuais = 0;
    energia_solar = 0;
    energia_sist_apoio = 0;
    excedente_verao = 0;
    fracao_solar = 0;
    s_sist_solar = 0;
    c_sist_solar = 0;
    reducao_solar = 0;
    investimento_resume = 0;
    colectores = 0;
    depositos_acessorios = 0;
    instalacao = 0;
    op_manutencao = 0;
    periodo_retorno = 0;

    var inputColetores = $("#coletores-reanalise").val();
   
    n_colectores = (inputColetores != undefined && inputColetores != "") ? new Number(inputColetores) : new Number((totalRacio / area_coletor_solar).toFixed(0));
    if(n_colectores<avisos[5].valor){
        alert(avisos[5].mensagem);
        return 0;
    }
    area_colectores = (inputColetores == undefined || inputColetores == "") ? new Number((n_colectores*area_coletor_solar)) : new Number((inputColetores*area_coletor_solar));
    
    volume_acumulacao_resume = area_colectores<8 ? (arred(area_colectores * volume_acumulacao_info,-1) + 10) : arred(area_colectores * volume_acumulacao_info,-2);
    necess_ener_anuais = total * fatores_conversao[1];
    energia_solar = totalEnergiaSolar * fatores_conversao[1];
    energia_sist_apoio = totalEnergiaBackup * fatores_conversao[1];

    excedente_verao = max(totalExcedenteSolarArrayPerc);
    excedente_verao_perc = excedente_verao * 100;

    fracao_solar = totalEnergiaSolarPerc * 100;

    s_sist_solar = total_cenarioI_custos;
    c_sist_solar = total_cenarioF_custos;
    reducao_solar = total_reducao_mes;
 
    colectores = (area_colectores < 10) ? investimentoI[0].info[0].valor * area_colectores : ((area_colectores >= 100) ? investimentoI[0].info[2].valor * area_colectores : investimentoI[0].info[1].valor * area_colectores);
    depositos_acessorios = (volume_acumulacao_resume < 500) ? volume_acumulacao_resume * investimentoI[1].info[0].valor : ((volume_acumulacao_resume>=2000) ? volume_acumulacao_resume*investimentoI[1].info[2].valor : volume_acumulacao_resume*investimentoI[1].info[1].valor);
    instalacao = (colectores+depositos_acessorios)*investimentoI[2].valor_direto;
    
    investimento_resume = colectores+depositos_acessorios+instalacao;
    
    op_manutencao = investimento_resume * investimentoI[3].valor_direto;
    
    periodo_retorno = investimento_resume / reducao_solar;

    $('#n-coletores-resumo').html(n_colectores.toFixed(0));
    $('#area-resumo').html(area_colectores.toFixed(1) + ' m2');
    $('#volume-resumo').html(volume_acumulacao_resume.toFixed(0) + ' litros');
    $('#nec-ener-resumo').html(necess_ener_anuais.toFixed(0) + ' kWh');
    $('#ener-solar-resumo').html(energia_solar.toFixed(0) + ' kWh');
    $('#ener-backup-resumo').html(energia_sist_apoio.toFixed(0) + ' kWh');
    $('#excedente-resumo').html(excedente_verao_perc.toFixed(0) + '%');
    $('#fracao-resumo').html(fracao_solar.toFixed(0) + '%');
    $('#s-sistema-resumo').html(s_sist_solar.toFixed(0) + ' €');
    $('#c-sistema-resumo').html(c_sist_solar.toFixed(0) + ' €');
    $('#reduc-anual-resumo').html(reducao_solar.toFixed(0) + ' €');
    $('#investimento-resumo').html(investimento_resume.toFixed(0) + ' €');
    $('#coletores-resumo').html(colectores.toFixed(0) + ' €');
    $('#deposito-resumo').html(depositos_acessorios.toFixed(0) + ' €');
    $('#instalacao-resumo').html(instalacao.toFixed(0) + ' €');
    $('#operacao-resumo').html(op_manutencao.toFixed(0) + ' €');
    $('#periodo-resumo').html(periodo_retorno.toFixed(1) + ' anos');

    if (n_colectores.toFixed(0) == avisos[4].valor) {
        $('.area-note').html(avisos[4].mensagem);
        $('.area-note').show();
    } else if (area_colectores > avisos[1].valor) {
        $('.area-note').html(avisos[1].mensagem);
        $('.area-note').show();
    } else {
        $('.area-note').html('');
        $('.area-note').hide();
    }

    if (excedente_verao_perc > 40 && excedente_verao_perc != undefined && excedente_verao_perc != '' && n_colectores>=1.5) {
        $('.excedente-note').html(avisos[0].mensagem);
        $('.excedente-note').show();
    } else {
        $('.excedente-note').html('');
        $('.excedente-note').hide();
    }

    chartData();

    return 1;
}

function max(calculos) {

    var max = 0;
    for (i = 0; i < calculos.length; i++) {
        if (calculos[i] > max) {
            max = calculos[i];
        }
    }
    return max;
}

function arred(valorArrendondar, comoArredondar) {
    var valor = 0;

    if (comoArredondar == (-1)) {
        valor = Math.round(valorArrendondar / 10) * 10;
    } else if (comoArredondar == (-2)) {
        valor = Math.round(valorArrendondar / 100) * 100;
    } else if (comoArredondar == (-3)) {
        valor = Math.round(valorArrendondar / 1000) * 1000;
    } else if (comoArredondar == (-4)) {
        valor = Math.round(valorArrendondar / 10000) * 10000;
    }

    return valor;
}

function maxChart(array) {
    var max = 0;
    if (array.length > 0) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] > max || max == 0) {
                max = array[i];
            }
        }
    }
    max += (max * 0.10);

    return max;

}

//GRAFICO
function chartData() {
    $('.final-graph #custosChart').remove();
    $('.final-graph #geralChart').remove();
    $('.final-graph').append('<canvas id="custosChart" width="400" height="400" role="img"></canvas>');
    $('.final-graph').append('<canvas id="geralChart" width="400" height="400" role="img"></canvas>');

    var varCustosVar = document.getElementById("custosChart").getContext('2d');
    var solarTermVar = document.getElementById("geralChart").getContext('2d');

    var cenarioI_custos_fixed = [];
    var cenarioF_custos_fixed = [];
    var totalEnergiaSolarUtilizada_fixed = [];
    var totalEnergiaBackupMes_fixed = [];
    var totalExcedenteSolarArray_fixed = [];
    var necessidades_mes_fixed = [];
    var totalEnergiaArray2_fixed = [];

    // TO fix array cenarioI_custos
    for (let i = 0; i < cenarioI_custos.length; i++) {
        cenarioI_custos_fixed[i] = cenarioI_custos[i].toFixed(0);
    }

    for (let i = 0; i < cenarioF_custos.length; i++) {
        cenarioF_custos_fixed[i] = cenarioF_custos[i].toFixed(0);
    }

    for (let i = 0; i < totalEnergiaSolarUtilizada.length; i++) {
        totalEnergiaSolarUtilizada_fixed[i] = totalEnergiaSolarUtilizada[i] / 3.6;
        totalEnergiaSolarUtilizada_fixed[i] = new Number(totalEnergiaSolarUtilizada_fixed[i].toFixed(0));
    }

    for (let i = 0; i < totalEnergiaBackupMes.length; i++) {
        totalEnergiaBackupMes_fixed[i] = totalEnergiaBackupMes[i] / 3.6;
        totalEnergiaBackupMes_fixed[i] = new Number(totalEnergiaBackupMes_fixed[i].toFixed(0));
    }

    for (let i = 0; i < totalEnergiaArray2.length; i++) {
        totalEnergiaArray2_fixed[i] = totalEnergiaArray2[i] / 3.6;
        totalEnergiaArray2_fixed[i] = new Number(totalEnergiaArray2_fixed[i].toFixed(0));
    }

    for (let i = 0; i < necessidades_mes.length; i++) {
        necessidades_mes_fixed[i] = necessidades_mes[i] / 3.6;
        necessidades_mes_fixed[i] = new Number(necessidades_mes_fixed[i].toFixed(0));
    }

    var maxCustos = maxChart(cenarioI_custos) > maxChart(cenarioF_custos) ? maxChart(cenarioI_custos) : maxChart(cenarioF_custos);

    if ((maxChart(necessidades_mes_fixed) > maxChart(totalEnergiaArray2_fixed)) && (maxChart(necessidades_mes_fixed) > maxChart(totalEnergiaSolarUtilizada_fixed)) && (maxChart(necessidades_mes_fixed) > maxChart(totalEnergiaBackupMes_fixed))) {
        var maxSolarTerm = maxChart(necessidades_mes_fixed);
    } else if ((maxChart(totalEnergiaArray2_fixed) > maxChart(necessidades_mes_fixed)) && (maxChart(totalEnergiaArray2_fixed) > maxChart(totalEnergiaSolarUtilizada_fixed)) && (maxChart(totalEnergiaArray2_fixed) > maxChart(totalEnergiaBackupMes_fixed))) {
        var maxSolarTerm = maxChart(totalEnergiaArray2_fixed);
    } else if ((maxChart(totalEnergiaSolarUtilizada_fixed) > maxChart(totalEnergiaArray2_fixed)) && (maxChart(totalEnergiaSolarUtilizada_fixed) > maxChart(necessidades_mes_fixed)) && (maxChart(totalEnergiaSolarUtilizada_fixed) > maxChart(totalEnergiaBackupMes_fixed))) {
        var maxSolarTerm = maxChart(totalEnergiaSolarUtilizada_fixed);
    } else {
        var maxSolarTerm = maxChart(totalEnergiaBackupMes_fixed);
    }

    var varCustosChart = new Chart(custosChart, {
        type: 'bar',
        data: {
            labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            datasets: [{
                label: 'Antes',
                data: cenarioI_custos_fixed,
                backgroundColor: 'rgba(75, 135, 203, 1)',
                borderColor: 'rgba(75, 135, 203, 1)',
                borderWidth: 1
            }, {
                label: 'Depois',
                data: cenarioF_custos_fixed,
                backgroundColor: 'rgba(95, 160, 55, 1)',
                borderColor: 'rgba(95, 160, 55, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        max: maxCustos,
                        callback: function (value, index, values) {
                            return value.toFixed(0) + '€';
                        }
                    },
                }],
                xAxes: [{
                    ticks: {
                        autoSkip: false,
                        maxRotation: 90,
                        minRotation: 90
                    }
                }]
            },
            title: {
                display: true,
                text: 'Custos Energéticos',
                fontSize: 16,
                fontColor: '#0099cc'
            },
            legend: {
                onClick: function (event, legendItem) { }
            }
        }
    });

    var solarTermChart = new Chart(geralChart, {
        type: 'bar',
        data: {
            datasets: [ {
                    label: 'Energia Solar',
                    data: totalEnergiaSolarUtilizada_fixed,
                    backgroundColor: 'rgba(95, 160, 55, 1)',
                    borderColor: 'rgba(95, 160, 55, 1)'
                },
                {
                    label: 'Energia de Apoio',
                    data: totalEnergiaBackupMes_fixed,
                    backgroundColor: 'rgba(209, 95, 35, 1)',
                    borderColor: 'rgba(209, 95, 35, 1)'
                },
                {
                    label: 'Necessidades',
                    data: necessidades_mes_fixed,
                    backgroundColor: 'rgba(0,0,0,0)',
                    borderColor: 'rgba(75, 135, 203, 1)',
                    pointBackgroundColor: 'rgba(0,0,0,0)',
                    pointBorderColor: 'rgba(0,0,0,0)',

                    // Changes this dataset to become a line
                    type: 'line'
                },
                {
                    label: 'Excedente',
                    data: totalEnergiaArray2_fixed,
                    backgroundColor: 'rgba(252, 203, 61, 1)',
                    borderColor: 'rgba(252, 203, 61, 1)'
                }
            ],
            labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        max: maxSolarTerm,
                        callback: function (value, index, values) {
                            return value.toFixed(0) + ' kWh';
                        }
                    }
                }],
                xAxes: [{
                    ticks: {
                        autoSkip: false,
                        maxRotation: 90,
                        minRotation: 90
                    },
                    stacked: true
                }]
            },
            title: {
                display: true,
                text: 'Balanço Energético (kWh)',
                fontSize: 16,
                fontColor: '#0099cc'
            },
            legend: {
                onClick: function(event, legendItem) {},
                labels: {
                    useLineStyle: true
                }
            }
        }
    });
}
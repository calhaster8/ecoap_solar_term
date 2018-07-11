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
        necessidades_mes[i] = new Number((calculos * (getCustomizedPerfilMensal(idPerfilMensal, i) * perfilVal) * meses_numero_horas[i].n_dias * (tmpReq - irradiacao_temp_amb_temp_agua[idDistrito].mesI[i].valorTempAgua) * fatores_conversao[0]).toFixed(0));
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

    totalCorrecaoOrientacao = correcaoOrientacao.toFixed(3);
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
        
        totalEnergiaArray[i] = new Number((((rendimento_otico * perdas[1].valor) - (coeficient_perdas * ((temperatura_utilizacao_alto - (irradiacao_temp_amb_temp_agua[idDistrito].mesI[i].valorTempAmb + irradiacao_temp_amb_temp_agua[idDistrito].mesI[i].valorTempAgua)) / ((getCorrecaoInclinacao(distritoLatitude, i)) * ((totalCorrecaoOrientacao * perdas[2].valor) * irradiacao_temp_amb_temp_agua[idDistrito].mesI[i].valorIrr) * (fatores_conversao[1] * 1000 / meses_numero_horas[i].n_horas_sol))))) * ((getCorrecaoInclinacao(distritoLatitude, i)) * ((totalCorrecaoOrientacao * perdas[2].valor) * irradiacao_temp_amb_temp_agua[idDistrito].mesI[i].valorIrr))) * (1 - perdas[0].valor) * meses_numero_horas[i].n_dias).toFixed(0);
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
    resume();
    nextStep();
}

function racio() {
    totalRacio = new Number(media(necessidades_mes)/media(totalEnergiaArray)).toFixed(2);
}

function media(el){
    
       var media=0;
    for(i=0;i<el.length;i++){
        if(i>=4 && i<9){
        media += new Number(el[i]);}
    }
    return media/5;
}
/*function racio() {
    totalRacio = new Number(total / totalEnergia).toFixed(2);
}*/

function energiaSolarCaptada2() {
    var coletores_reanalise = $('#coletores-reanalise').val();

    totalEnergiaArray2 = [];
    totalEnergia2 = 0;

    for (i = 0; i < meses_numero_horas.length; i++) { 

        if (coletores_reanalise == '' || coletores_reanalise == undefined) {
            totalEnergiaArray2[i] = totalEnergiaArray[i] * (totalRacio / 2.25).toFixed(0) * 2.25;
        } else {
            totalEnergiaArray2[i] = totalEnergiaArray[i] * coletores_reanalise;
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

    totalEnergiaBackupMes = [];
    totalEnergiaBackup = 0;

    for (i = 0; i < meses_numero_horas.length; i++) {
        if (necessidades_mes[i]-totalEnergiaArray2[i] < 0) {
            totalEnergiaBackupMes[i] = 0;
        } else {
            totalEnergiaBackupMes[i] = necessidades_mes[i] - totalEnergiaArray2[i];
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
        necessidades_mes_kWh[i] = new Number(necessidades_mes[i] * fatores_conversao[1]).toFixed(0);
        total_mes_kWh += necessidades_mes_kWh[i];
    }
    
}


/*function cenarioI() {
    var inputRendimento = $("#rend").val();
    var sist_aqs = $("#sis-prod").val();
    var age = $("#age").val();
    var custosUnit = $("#custo-unit-input").val();
    var rendCenarioI=0;
    
    cenarioI_mes = [];
    cenarioI_custos = [];
    total_cenarioI_mes = 0;
    total_cenarioI_custos = 0;

    if (inputRendimento == 1 && sistemas_prod_aqs[sist_aqs].rendimento[age].nome == idades[age]){
        rendCenarioI = sistemas_prod_aqs[sist_aqs].rendimento[age].valor;
    
        for (i = 0; i < meses_numero_horas.length; i++) {
            
            cenarioI_mes[i] = new Number(necessidades_mes_kWh[i] / rendCenarioI).toFixed(0);
            cenarioI_custos[i] = new Number(cenarioI_mes[i] * custosUnit).toFixed(2);
            total_cenarioI_mes += new Number(cenarioI_mes[i]);
            total_cenarioI_custos += new Number(cenarioI_custos[i]);
        }
        total_cenarioI_custos = total_cenarioI_custos.toFixed(2);
    }
}*/
function cenarioI() {
    var inputRendimento = ($("#rend").val() == 2) ? $('#iRendMan').val() : $("#rend").val();
    var sist_aqs = $("#sis-prod").val();
    var age = $("#age").val();
    var custosUnit = $("#custo-unit-input").val();
    var rendCenarioI = 0;

    cenarioI_mes = [];
    cenarioI_custos = [];
    total_cenarioI_mes = 0;
    total_cenarioI_custos = 0;

    if (inputRendimento == 1 && sistemas_prod_aqs[sist_aqs].rendimento[age].nome == idades[age]) {
        rendCenarioI = sistemas_prod_aqs[sist_aqs].rendimento[age].valor;
    } else {
        rendCenarioI = inputRendimento/100;
    }

    for (i = 0; i < meses_numero_horas.length; i++) {

        cenarioI_mes[i] = new Number(necessidades_mes_kWh[i] / rendCenarioI).toFixed(0);
        cenarioI_custos[i] = new Number(cenarioI_mes[i] * custosUnit).toFixed(2);
        total_cenarioI_mes += new Number(cenarioI_mes[i]);
        total_cenarioI_custos += new Number(cenarioI_custos[i]);
    }
    total_cenarioI_custos = total_cenarioI_custos.toFixed(2);
}




/*function cenarioF() {    

    var inputRendimento = $("#rend").val();
    var sist_aqs = $("#sis-prod").val();
    var age = $("#age").val();
    var custosUnit = $("#custo-unit-input").val();
    var rendCenarioF = 0;
    cenarioF_mes = [];
    total_cenarioF_mes = 0;
    cenarioF_custos = [];
    total_cenarioF_custos = 0;

    if (inputRendimento == 1 && sistemas_prod_aqs[sist_aqs].rendimento[age].nome == idades[age]) {
        rendCenarioF = sistemas_prod_aqs[sist_aqs].rendimento[age].valor;

        for (i = 0; i < meses_numero_horas.length; i++) {

            cenarioF_mes[i] = new Number(totalEnergiaBackupMes[i]*fatores_conversao[1] / rendCenarioF).toFixed(0);
            total_cenarioF_mes += new Number(cenarioF_mes[i]);
            cenarioF_custos[i] = new Number(cenarioF_mes[i] * custosUnit).toFixed(2);
            total_cenarioF_custos += new Number(cenarioF_custos[i]);
        }
        total_cenarioF_custos = total_cenarioF_custos.toFixed(2);
    }
}*/
function cenarioF() {

    var inputRendimento = ($("#rend").val() == 2) ? $('#iRendMan').val() : $("#rend").val();
    var sist_aqs = $("#sis-prod").val();
    var age = $("#age").val();
    var custosUnit = $("#custo-unit-input").val();
    var rendCenarioF = 0;
    cenarioF_mes = [];
    total_cenarioF_mes = 0;
    cenarioF_custos = [];
    total_cenarioF_custos = 0;

    if (inputRendimento == 1 && sistemas_prod_aqs[sist_aqs].rendimento[age].nome == idades[age]) {
        rendCenarioF = sistemas_prod_aqs[sist_aqs].rendimento[age].valor;
    } else {
        rendCenarioF = inputRendimento/100;
    }

    for (i = 0; i < meses_numero_horas.length; i++) {

        cenarioF_mes[i] = new Number(totalEnergiaBackupMes[i] * fatores_conversao[1] / rendCenarioF).toFixed(0);
        total_cenarioF_mes += new Number(cenarioF_mes[i]);
        cenarioF_custos[i] = new Number(cenarioF_mes[i] * custosUnit).toFixed(2);
        total_cenarioF_custos += new Number(cenarioF_custos[i]);
    }
    total_cenarioF_custos = total_cenarioF_custos.toFixed(2);

}

function getSistemasProdAQSValues() {
    var id = $("#sis-prod").val();

    if (id != "" && id != undefined && id >= 0) {
        $("#custo-unit-input").attr("value", sistemas_prod_aqs[id].custo_unit);
        //        $('.cop').removeClass('hide-cop-rend');
        //        $('.rendimento').addClass('hide-cop-rend');
    }
    //    else {
    //        $('.cop').addClass('hide-cop-rend');
    //        $('.rendimento').removeClass('hide-cop-rend');
    //    }
}

function getCopRendValues() {

    var selectedRend = $('#rend').val();
    if (selectedRend == 2) {
        $('#iRendMan').show();
        $('#labelIRendman').show();

    } else {
        $('#iRendMan').val("");
        $('#iRendMan').hide();
        $('#labelIRendman').hide();
    }

    // aqui removi a comparação com o COP usamos só a do rendimento
    if (selectedRend == 1) {
        $('.age').removeClass('hide-age');
    } else {
        $('.age').addClass('hide-age');
    }
}



function reduction(){
    reducao_mes = [];
    total_reducao_mes = 0;
    reducao_percent=[];
    total_reduca_percent = 0;

    for (i = 0; i < meses_numero_horas.length; i++) {

        reducao_mes[i] = new Number(cenarioI_custos[i]-cenarioF_custos[i]).toFixed(0);
        total_reducao_mes += new Number(reducao_mes[i]);
        reducao_percent[i] = new Number(reducao_mes[i] / cenarioI_custos[i] * 100).toFixed(0);
       
    }
    total_reduca_percent = (total_reducao_mes/total_cenarioI_custos*100).toFixed(0);
}



function resume(){

    // resume vars
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

    //esta nao da
    //n_colectores = (inputColetores != undefined && !empty(inputColetores)) ? new Number(inputColetores) : new Number(totalRacio/area_coletor_solar).toFixed(0);
    //area_colectores = (inputColetores != undefined && !empty(inputColetores)) ? new Number(n_colectores * area_coletor_solar).toFixed(2) : new Number(inputColetores * area_coletor_solar).toFixed(2);
    
    //esta da
    n_colectores = (inputColetores != undefined && inputColetores != "") ? new Number(inputColetores) : new Number(totalRacio / area_coletor_solar).toFixed(0);
    area_colectores = (inputColetores == undefined || inputColetores == "") ? new Number(n_colectores * area_coletor_solar).toFixed(2) : new Number(inputColetores * area_coletor_solar).toFixed(2);
    
    volume_acumulacao_resume = area_colectores * volume_acumulacao_info;
    necess_ener_anuais = new Number(total * fatores_conversao[1]).toFixed(0);
    energia_solar = new Number(totalEnergiaSolar * fatores_conversao[1]).toFixed(0);
    energia_sist_apoio = new Number(totalEnergiaBackup * fatores_conversao[1]).toFixed(0);

    //excedente_verao = (max(excedenteSolarPerc) > avisos[0].valor) ? max(excedenteSolarPerc) : "";
    //se o excende de verão for maior do que aviso[0].valor então mostra esta informação no resumo, senão não mostra nada

    excedente_verao = (max(totalExcedenteSolarArrayPerc) > avisos[0].valor) ? max(totalExcedenteSolarArrayPerc) : "";
    excedente_verao_perc = new Number(excedente_verao * 100).toFixed(0);

    fracao_solar = new Number(totalEnergiaSolarPerc * 100).toFixed(0);

    s_sist_solar = total_cenarioI_custos;
    c_sist_solar = total_cenarioF_custos;
    reducao_solar = total_reducao_mes;
 
    colectores = (area_colectores < 10) ? investimentoI[0].info[0].valor * area_colectores : ((area_colectores >= 100) ? investimentoI[0].info[2].valor * area_colectores : investimentoI[0].info[1].valor * area_colectores);
    depositos_acessorios = (volume_acumulacao_resume < 500) ? volume_acumulacao_resume * investimentoI[1].info[0].valor : ((volume_acumulacao_resume>=2000) ? volume_acumulacao_resume*investimentoI[1].info[2].valor : volume_acumulacao_resume*investimentoI[1].info[1].valor);
    instalacao = (colectores+depositos_acessorios)*investimentoI[2].valor_direto;
    
    investimento_resume = colectores+depositos_acessorios+instalacao;
    
    op_manutencao = new Number(investimento_resume * investimentoI[3].valor_direto).toFixed(2);
    
    periodo_retorno = new Number(investimento_resume / reducao_solar).toFixed(1);

    $('#n-coletores-resumo').html(n_colectores);
    $('#area-resumo').html(area_colectores + ' m2');
    $('#volume-resumo').html(volume_acumulacao_resume + ' litros');
    $('#nec-ener-resumo').html(necess_ener_anuais);
    $('#ener-solar-resumo').html(energia_solar);
    $('#ener-backup-resumo').html(energia_sist_apoio);
    $('#excedente-resumo').html(excedente_verao_perc + '%');
    $('#fracao-resumo').html(fracao_solar + '%');
    $('#s-sistema-resumo').html(s_sist_solar + ' €');
    $('#c-sistema-resumo').html(c_sist_solar + ' €');
    $('#reduc-anual-resumo').html(reducao_solar + ' €');
    $('#investimento-resumo').html(investimento_resume + ' €');
    $('#coletores-resumo').html(colectores + ' €');
    $('#deposito-resumo').html(depositos_acessorios + ' €');
    $('#instalacao-resumo').html(instalacao + ' €');
    $('#operacao-resumo').html(op_manutencao + ' €');
    $('#periodo-resumo').html(periodo_retorno + ' anos');
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


/*function min(calculos) {
    var min=0;
    for (i = 0; i < calculos.length; i++) {
        if(min==0){
            min = calculos[i];
        }else if (calculos[i] < min) {
            min = calculos[i];
        }
    }
    return min;
}*/
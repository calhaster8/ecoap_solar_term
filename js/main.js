$(document).ready(function() {
    buildDistrito();
    buildSistemaProdAQS();
    buildAge();
    buildTipoConsumo();
    buildPerfilMensal();
    buildPerfilSemanal();
    buildTempReq();
    buildDesvios();
    getSistemasProdAQSValues();

    $('#distrito').change(getDistrictValues);
    $('#sis-prod').change(getSistemasProdAQSValues);
    $('#cop').change(getCopRendValues);
    $('#rend').change(getCopRendValues);
    $('#tipo-consumo' + rowId).change(getTipoConsumo);
    $('#perfil-mensal').change(getPerfilMensal);
    $('#perfil-semanal').change(getPerfilSemanal);
    $('#orientacao-sel').change(getDesvios);

    
    $('#orientacao-input').change(function(){
        if($(this).val()>70 || $(this).val()<0){
            $(this).attr("style","color:red");
        }else{
            $(this).removeAttr("style");
        }
    });

    $('#perfil-semanal').change(function() {
        var idLocal = $('#perfil-semanal').val();
        
        if(idLocal == 0 && idLocal != undefined && idLocal != '') {
            $('#perfil-semanal').css('width', '56%');
        } else {
            $('#perfil-semanal').css('width', '52%');
        }
    });
    
    
    $("#reanalise-but").click(function(){
        totalNecessidadesEnergiaFunction();
    });
    
    $('#reload-but').click(function(){
        location.reload();
    });
    
});

function buildDistrito() {
    for(var i = 0; i < irradiacao_temp_amb_temp_agua.length; i++) {
        $('#distrito').append($('<option class="op"></option>').val(i).html(irradiacao_temp_amb_temp_agua[i].distritoI));
    }
}

function getDistrictValues() {
    var id = new Number($("#distrito").val());
    $("#distrito-latitude").attr("value", irradiacao_temp_amb_temp_agua[id].latitude);
}

function buildSistemaProdAQS() {
    for(var i = 0; i < sistemas_prod_aqs.length; i++) {
        $('#sis-prod').append($('<option class="op"></option>').val(i).html(sistemas_prod_aqs[i].nome));
    }
}

function getSistemasProdAQSValues() {
    var id = $("#sis-prod").val();

    if (id != "" && id != undefined && id == 0) {
        $("#labelRendimento").html("COP");
        $("#rend").val("");
        $("#labelIRendman").html("Insira o COP");
        $("#labelIRendman").hide();
        $("#iRendMan").hide();
        $("#iRendMan").val("");
        $("#iRendMan").removeAttr("disabled");
        $("#iRendMan").attr("placeholder", "0");
        $('#rend').find("option[value='2']").html("Inserir COP");
    } else if (id != "" && id != undefined && id > 0) {
        $("#labelRendimento").html("Rendimento (%)");
        $("#rend").val("");
        $("#labelIRendman").html("Insira o rendimento");
        $("#age").val("");
        $("#labelIRendman").hide();
        $("#iRendMan").hide();
        $("#iRendMan").val("");
        $("#iRendMan").removeAttr("disabled");
        $("#iRendMan").attr("placeholder", "0%");
        $('#rend').find("option[value='2']").html("Inserir rendimento");
    } else {
        $("#labelRendimento").html("Rendimento (%) / COP");
        $("#rend").val("");
        $("#age").val("");
        $("#age").hide();
        $("#labelIRendman").hide();
        $("#iRendMan").hide();
        $("#iRendMan").val("");
        $("#iRendMan").removeAttr("disabled");
        $('#rend').find("option[value='2']").html("Inserir rendimento");
    }

    if (id != "" && id != undefined && id >= 0) {
        $('#custo-unit-input').val((sistemas_prod_aqs[id].custo_unit * sistemas_prod_aqs[id].fator_conversao).toFixed(2));
        // $("#custo-unit-input").attr("value", sistemas_prod_aqs[id].custo_unit);
        var begin = $("#custo-unit-label")[0].textContent.indexOf("(");
        var text = $("#custo-unit-label")[0].textContent.substring(0, begin) + " (€/" + sistemas_prod_aqs[id].unidade + ")";

        $("#custo-unit-label")[0].textContent = text;
    }
    getCopRendValues();
}

function getCopRendValues() {

    var idLocal = $('#sis-prod').val();
    var selectedRend = $('#rend').val();
    if (selectedRend != "" && selectedRend != undefined && selectedRend == 2 && idLocal == 0 && idLocal != "" && idLocal != undefined) {
        $('#rend').find("option[value='2']").html("Inserir COP");
        $('#iRendMan').show();
        //$('#labelIRendman').show();
        $('.age').hide();
        $('#age').val("");
    } else if (selectedRend != "" && selectedRend != undefined && selectedRend == 2 && idLocal > 0 && idLocal != "" && idLocal != undefined) {
        $('#rend').find("option[value='2']").html("Inserir rendimento");
        $('#iRendMan').show();
        //$('#labelIRendman').show();
        $('.age').hide();
        $('#age').val("");
    } else if (selectedRend != "" && selectedRend != undefined && selectedRend == 1) {
        $('#iRendMan').val("");
        $('.age').show();
        $('#age').show();
        $('#age').val("");
        $('#iRendMan').hide();
        $('#labelIRendman').hide();
    } else {
        $('#iRendMan').hide();
        $('#labelIRendman').hide();
        $('.age').hide();
        $('#age').val("");
    }
}

function buildAge() {
    for(var i = 0; i < sistemas_prod_aqs[i].rendimento.length; i++) {
        $('#age').append($('<option class="op"></option>').val(i).html(sistemas_prod_aqs[i].rendimento[i].nome));
    }
}

function buildTipoConsumo() {
    for(var i = 0; i < consumo_diario_agua.length; i++) {
        $('.tipo-consumo').append($('<option class="op"></option>').val(i).html(consumo_diario_agua[i].nome));
    }
}

function getTipoConsumo() {
    var id = new Number($('#tipo-consumo' + rowId).val());
    $('#tipo-consumo-descricao' + rowId).html(consumo_diario_agua[id].numero_de);
}

$(function () {
    $('#add').on('click', function () {
        rowId++;

        var data = $("#tb tr:eq(1)").clone(true).appendTo("#tb").insertBefore('#add_row');
        data.find("input").val('').attr("id", "tipo-consumo-value" + rowId);
        data.find('select').attr("id", "tipo-consumo" + rowId);
        data.find('td:eq(1)').attr('id', 'tipo-consumo-descricao' + rowId).html('');


    });
    $(document).on('click', '#remove', function () {
        rowId--;
        
        var trIndex = $(this).closest("tr").index();
        if (trIndex > 1) {
            $(this).closest("tr").remove();
        } else {
            alert("Não pode remover a última coluna.");
        }
    });
});      








function buildPerfilMensal() {
    for(var i = 0; i < perfil_mensal.length; i++) {
        $('#perfil-mensal').append($('<option class="op"></option>').val(i).html(perfil_mensal[i].nome));
    }
}

function getPerfilMensal() {
    if($('#perfil-mensal').val() == 3) {
        $('.table-mensal').removeClass('hide-perfil-mensal');
    } else {
        $('.table-mensal').addClass('hide-perfil-mensal');
    }

    //CHAMAR FUNCAO
    getInclinacao();
}

function buildPerfilSemanal() {
    for (var i = 0; i < perfil_semanal.length; i++) {
        $('#perfil-semanal').append($('<option class="op"></option>').val(i).html(perfil_semanal[i].nome));
    }
}

function getPerfilSemanal() {
    if ($('#perfil-semanal').val() == 3) {
        $('.table-semanal').removeClass('hide-perfil-semanal');
    } else {
        $('.table-semanal').addClass('hide-perfil-semanal');
    }
}

function buildTempReq() {
    $('#temp-req').attr('value', temperatura_utilizacao_alto);
}

function buildDesvios() {
    for(var i = 0; i < desvios.length; i++) {
        $('#orientacao-sel').append($('<option class="op"></option>').val(i).html(desvios[i].nome));
    }
}

function getDesvios() {
    var id = new Number($('#orientacao-sel').val());
    $('#orientacao-input').attr('value', desvios[id].valor);

    if($('#orientacao-sel').val() == 5) {
        $('.nota-outro-desvio').removeClass('hide-nota');
    } else {
        $('.nota-outro-desvio').addClass('hide-nota');
    }
}

function getInclinacao() {
    var idDist = new Number($("#distrito").val());
    var idPerfil = new Number($('#perfil-mensal').val());
    $('#inclinacao-input').attr("value", irradiacao_temp_amb_temp_agua[idDist].latitude + perfil_mensal[idPerfil].latitude);
}



// BUTTONS STEPS
function nextStep() {
    var id = $('.step:visible').data('id');
    var nextId = $('.step:visible').data('id') + 1;
    

    if ($('#menu-choice-sel').val() == 0) {
        $('[data-id="' + id + '"]').hide();
        $('[data-id="' + nextId + '"]').show();

        if ($('.anterior:hidden').length > 1) {
            $('.anterior').show();
        }

        if (nextId < 4) {
            $('.but-2').show();
            $('.end-step').hide();
        }

        if (nextId == 3) {
            $('.but-2').hide();
            $('.end-step').show();
        }

        if (nextId == 4 || nextId == 5) {   
            if(nextId == 5 && id==4){
                $('[data-id="' + id + '"]').show();
            }          
            $('#reanalise-but').show();
            $('#reload-but').show();
            $('.end-but').hide();
        }
    }
}


//STEPS
function prevStep() {
    var id = $('.step:visible').data('id');
    var prevId = $('.step:visible').data('id') - 1;
    $('[data-id="' + id + '"]').hide();
    $('[data-id="' + prevId + '"]').show();

    if (prevId == 1) {
        $('.anterior').hide();
    }

    if (prevId < 3) {
        $('.but-2').show();
        $('.end-step').hide();
    }

    if (prevId == 3) {
        $('.but-2').hide();        
        $('#reanalise-but').hide();
        $('#reload-but').hide();
        $('.end-step').show();
        $('.end-but').show();
    }

}
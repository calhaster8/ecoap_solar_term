function buildDistrito(){for(var e=0;e<irradiacao_temp_amb_temp_agua.length;e++)$("#distrito").append($('<option class="op"></option>').val(e).html(irradiacao_temp_amb_temp_agua[e].distritoI))}function getDistrictValues(){var e=new Number($("#distrito").val());$("#distrito-latitude").attr("value",irradiacao_temp_amb_temp_agua[e].latitude)}function buildSistemaProdAQS(){for(var e=0;e<sistemas_prod_aqs.length;e++)$("#sis-prod").append($('<option class="op"></option>').val(e).html(sistemas_prod_aqs[e].nome))}function getSistemasProdAQSValues(){var e=new Number($("#sis-prod").val());$("#custo-unit-input").attr("value",sistemas_prod_aqs[e].custo_unit),0==$("#sis-prod").val()?($(".cop").removeClass("hide-cop-rend"),$(".rendimento").addClass("hide-cop-rend")):($(".cop").addClass("hide-cop-rend"),$(".rendimento").removeClass("hide-cop-rend"))}function getCopRendValues(){var e=$("#rend").val();2==e?$("#iRendMan").show():($("#iRendMan").val(""),$("#iRendMan").hide()),1==$("#cop").val()||1==e?$(".age").removeClass("hide-age"):$(".age").addClass("hide-age")}function buildAge(){for(var e=0;e<sistemas_prod_aqs[e].rendimento.length;e++)$("#age").append($('<option class="op"></option>').val(e).html(sistemas_prod_aqs[e].rendimento[e].nome))}function buildTipoConsumo(){for(var e=0;e<consumo_diario_agua.length;e++)$(".tipo-consumo").append($('<option class="op"></option>').val(e).html(consumo_diario_agua[e].nome))}function getTipoConsumo(){var e=new Number($("#tipo-consumo"+rowId).val());$("#tipo-consumo-descricao"+rowId).html(consumo_diario_agua[e].numero_de)}function buildPerfilMensal(){for(var e=0;e<perfil_mensal.length;e++)$("#perfil-mensal").append($('<option class="op"></option>').val(e).html(perfil_mensal[e].nome))}function getPerfilMensal(){3==$("#perfil-mensal").val()?$(".table-mensal").removeClass("hide-perfil-mensal"):$(".table-mensal").addClass("hide-perfil-mensal"),getInclinacao()}function buildPerfilSemanal(){for(var e=0;e<perfil_semanal.length;e++)$("#perfil-semanal").append($('<option class="op"></option>').val(e).html(perfil_semanal[e].nome))}function getPerfilSemanal(){3==$("#perfil-semanal").val()?$(".table-semanal").removeClass("hide-perfil-semanal"):$(".table-semanal").addClass("hide-perfil-semanal")}function buildTempReq(){$("#temp-req").attr("value",temperatura_utilizacao_alto)}function buildDesvios(){for(var e=0;e<desvios.length;e++)$("#orientacao-sel").append($('<option class="op"></option>').val(e).html(desvios[e].nome))}function getDesvios(){var e=new Number($("#orientacao-sel").val());$("#orientacao-input").attr("value",desvios[e].valor),5==$("#orientacao-sel").val()?$(".nota-outro-desvio").removeClass("hide-nota"):$(".nota-outro-desvio").addClass("hide-nota")}function getInclinacao(){var e=new Number($("#distrito").val()),a=new Number($("#perfil-mensal").val());$("#inclinacao-input").attr("value",irradiacao_temp_amb_temp_agua[e].latitude+perfil_mensal[a].latitude)}function nextStep(){var e=$(".step:visible").data("id"),a=$(".step:visible").data("id")+1;0==$("#menu-choice-sel").val()&&($('[data-id="'+e+'"]').hide(),$('[data-id="'+a+'"]').show(),$(".anterior:hidden").length>1&&$(".anterior").show(),a<4&&($(".but-2").show(),$(".end-step").hide()),3==a&&($(".but-2").hide(),$(".end-step").show()),4==a&&$(".end-but").hide())}function prevStep(){var e=$(".step:visible").data("id"),a=$(".step:visible").data("id")-1;$('[data-id="'+e+'"]').hide(),$('[data-id="'+a+'"]').show(),1==a&&$(".anterior").hide(),a<3&&($(".but-2").show(),$(".end-step").hide()),3==a&&($(".but-2").hide(),$(".end-step").show(),$(".end-but").show())}$(document).ready(function(){buildDistrito(),buildSistemaProdAQS(),buildAge(),buildTipoConsumo(),buildPerfilMensal(),buildPerfilSemanal(),buildTempReq(),buildDesvios(),$("#distrito").change(getDistrictValues),$("#sis-prod").change(getSistemasProdAQSValues),$("#cop").change(getCopRendValues),$("#rend").change(getCopRendValues),$("#tipo-consumo"+rowId).change(getTipoConsumo),$("#perfil-mensal").change(getPerfilMensal),$("#perfil-semanal").change(getPerfilSemanal),$("#orientacao-sel").change(getDesvios)}),$(function(){$("#add").on("click",function(){rowId++;var e=$("#tb tr:eq(1)").clone(!0).appendTo("#tb").insertBefore("#add_row");e.find("input").val("").attr("id","tipo-consumo-value"+rowId),e.find("select").attr("id","tipo-consumo"+rowId),e.find("td:eq(1)").attr("id","tipo-consumo-descricao"+rowId).html("")}),$(document).on("click","#remove",function(){rowId--,$(this).closest("tr").index()>1?$(this).closest("tr").remove():alert("Não pode remover a última coluna.")})});
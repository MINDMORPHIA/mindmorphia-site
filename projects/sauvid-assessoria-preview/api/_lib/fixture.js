'use strict';
module.exports={
  client:{displayName:'Cliente de homologação'},
  summary:{stage:'Em acompanhamento',lastCheck:'05/10/2026',nextAction:'Nova verificação'},
  organizations:[
    {name:'SPC',status:'Baixa informada',badge:'Em revisão'},
    {name:'SERASA',status:'A confirmar',badge:'Sem conclusão'},
    {name:'BOA VISTA',status:'Em acompanhamento',badge:'Atualizado'},
    {name:'PROTESTOS',status:'Fora do escopo',badge:'Não aplicável'}
  ],
  events:[
    {date:'05/10/2026',title:'Nova conferência registrada',message:'A informação do SPC foi atualizada como “baixa informada” e permanece em revisão antes de qualquer conclusão definitiva.'},
    {date:'01/10/2026',title:'Atendimento em acompanhamento',message:'Os demais órgãos mantêm suas situações próprias. O histórico anterior foi preservado.'},
    {date:'29/09/2026',title:'Atendimento cadastrado',message:'Registro inicial criado para acompanhamento por órgão.'}
  ]
};

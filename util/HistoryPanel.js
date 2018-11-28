
Ext.define('Application.components.HistoryPanel', {
  extend: 'Ext.grid.GridPanel',
  initComponent: function() {
    var component = this;
    var procedure_id = component.procedure_id;
    var store = getProcedureHistoryStore(procedure_id);
   
    Ext.apply(this, {
      store: store,
      columns: [
      //2014/03/06 ptanya 4291 Информация о пользователе
      {
          header: 'Пользователь',
          width: 150,
          renderer: function(v, m, r){
                  return r['data']['user']['username']
                          + ' (' + r['data']['user']['last_name']
                          + ' ' + r['data']['user']['first_name']
                          + ' ' + r['data']['user']['middle_name']
                          + ')'
                          ;
                }
      },{
          header: 'Дата внесения изменений',
          width: 150,
          renderer: Ext.util.Format.dateRenderer('d.m.Y H:i'),
          dataIndex: 'date'
      },{
          header: 'Наименование параметра',
          width: 380,
          dataIndex: 'field'
      },{
        header: 'Номер лота',
        width: 100,
        dataIndex: 'lot_id'
      },{
          header: 'Старое значение',
          dataIndex: 'from',
          renderer: function(v, m, r){
              if (!Main.config.show_gmt){ //если в конфиге стоит не показывать gmt и есть значение то обрезаем первые 20 символов
                  if (r['data']['field']=='Дата публикации' || r['data']['field']=='Дата и время окончания подачи заявок на участие' ){
                      if (r['data']['from']!='не указано'){
                          v = Ext.util.Format.substr(v,0,19);
              }}}
              return v;},
          width: 200
      },{
          header: 'Новое значение',
          dataIndex: 'to',
          renderer: function(v, m, r){
              if (!Main.config.show_gmt){ //если в конфиге стоит не показывать gmt и есть значение то обрезаем первые 20 символов
                  if (r['data']['field']=='Дата публикации' || r['data']['field']=='Дата и время окончания подачи заявок на участие'){
                      if (r['data']['date']!='не указано'){
                          v = Ext.util.Format.substr(v,0,19);
                      }}}
              return v;},
          width: 200
      }],
      viewConfig: {
        forceFit: true
      }
    });
    Application.components.HistoryPanel.superclass.initComponent.call(this);
  }
});

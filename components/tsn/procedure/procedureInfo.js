/**
 * @class Application.components.procedureViewPanel
 * @extends Application.components.keyValuePanel
 *
 * Панель для отображения информации об извещении.
 *
 *
 */

Ext.define('Application.components.procedureInfo', {
  extend: 'Ext.panel.Panel',

  autoHeight: true,

  /**
   * Ключи данных из модели и заголовки для них.
   */
  fields: {
    'registry_number'             : 'Номер извещения:',
    'title'                       : 'Наименование процедуры:',
    'procedure_type_vocab'        : 'Форма торгов:',
    'date_published'              : 'Дата публикации:'
  },


  initComponent: function() {

    this.addEvents(
      /**
       * @event dataload
       * Срабатывает во время загрузки данных в подлежащем компонентe.
       * Для релея.
       * @param {Object} data Загруженные данные
       */
      'dataload'
    );

    if (!isCustomer() && !isAdmin()) {
      delete this.fields.remote_id;
    }
    this.items = [{
      xtype: 'Application.components.keyValuePanel',
      title: 'Сведения о процедуре',
      style     : 'margin: 5px 5px 0px 5px;',

      /**
       * Ключи данных из модели и заголовки для них.
       */
      fields: this.fields,

      templates: {
        date_published: Ext.util.Format.localDateOnlyRenderer
      }
    }];

    this.on('added', function() {
      var fieldSet = this.getComponent(0);
      this.relayEvents(fieldSet, ['dataload']);

      if (this.procedureAutoLoad && this.procedure_id && this.tplData === undefined) {
        // Загружаем данные с сервера

        var params = {
          mask: true,
          mask_el: this.getEl(),
          scope: fieldSet,
          monitor_valid: this
        };

        performRPCCall(RPC_tsn.Procedure.load, [this.procedure_id], params, function(resp) {
          if (resp && resp.success) {
            if (resp.procedure)
              fieldSet.loadData(resp.procedure);
          } else if (resp) {
            echoResponseMessage(resp);
          }
        });

      } else {
        //console.debug(this.tplData);
        // Загружаем предоставленные при инициализации (шаблонные) данные
        fieldSet.loadData(this.tplData);
      }

    }, this);

    Application.components.procedureInfo.superclass.initComponent.call(this);

  }
});

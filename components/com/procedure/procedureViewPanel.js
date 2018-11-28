/**
 * @class Application.components.procedureViewPanel
 * @extends Application.components.keyValuePanel
 *
 * Панель для отображения информации об извещении.
 *
 *
 */

Ext.define('Application.components.procedureViewPanel', {
  extend: 'Ext.panel.Panel',

  autoHeight: true,

  /**
   * Ключи данных из модели и заголовки для них.
   */
  fields: {
    'registry_number'             : 'Номер извещения:',
    'remote_id'                   : 'Номер процедуры:',
    'title'                       : 'Наименование процедуры:',
    'with_prequalification'       : 'С проведением квалификационного отбора:',//2013/10/30 ptanya 3657: #41608 нужно, чтобы переменная попала в шаблон
    'procedure_type_vocab'        : 'Форма торгов:',
    'purchase_method_name'        : 'Тип закупки в ЕИС',
    'peretorg_possible'           : 'Возможность проведения процедуры переторжки:',
    'date_published'              : 'Дата публикации:',
    'offers_step_min'             : 'Шаг ценовых предложений от:',
    'offers_step_max'             : 'Шаг ценовых предложений до:',
    'step_is_exact'               : 'Шаг указан в:',
    'step_reduction'              : 'Шаг понижения:',
    'step_auction'                : 'Шаг аукциона:',
    'offers_wait_time'            : 'Время ожидания ценовых предложений:',
    'procedure_subject_codes'     : 'Код предмета закупки',
    'procedure_inner_classification'     : 'Код внутреннего классификатора закупки',
    'paper_form'                  : 'Заявки принимаются в бумажной форме'
  },


  initComponent: function() {

    var fieldset_id = Ext.id();

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
      fieldsShowAlways: ['step_is_exact'],
      id: fieldset_id,

      templates: {
        date_published: Ext.util.Format.localDateText,
        offers_step_min: Ext.util.Format.formatOffersStep,
        offers_step_max: Ext.util.Format.formatOffersStep,
        step_is_exact: function(v){return v?'валюте договора':'процентах от начальной цены договора';},
        procedure_type_vocab: '{procedure_type_vocab} <tpl if="values.with_prequalification"> c проведением квалификационного отбора</tpl>',
        offers_wait_time: '{offers_wait_time} минут',
        procedure_subject_codes: new Ext.XTemplate('<tpl if="values.procedure_subject_codes">'
          + '<tpl for="procedure_subject_codes">'
          + '{values.full_name}<br />'
          + '</tpl>'
          + '</tpl>'),
        procedure_inner_classification: new Ext.XTemplate('<tpl if="values.procedure_inner_classification">'
          + '<tpl for="procedure_inner_classification">'
          + '{values.full_name}<br />'
          + '</tpl>'
          + '</tpl>'),
        step_reduction: Ext.util.Format.formatPrice,
        step_auction: Ext.util.Format.formatPrice
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

        var data = {
          procedure_id: this.procedure_id,
          is_view: 1
        };
        performRPCCall(RPC.Procedure.load, [data], params, function(resp) {
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

    Application.components.procedureViewPanel.superclass.initComponent.call(this);

    this.on('render', function(){
      Ext.getCmp(fieldset_id).on('dataload', function(v){
        if (!v) {
          return;
        }
        this.hideKey('with_prequalification'); //2013/10/30 ptanya 3657: #41608 поле нужно, чтобы переменная попала в шаблон
        if (Application.models.Procedure.groups.auctions.indexOf(v.procedure_type)<0) {
          this.hideKey('offers_step_min');
          this.hideKey('offers_step_max');
          this.hideKey('step_is_exact');
          this.hideKey('offers_wait_time');
        }
        //if (Application.models.Procedure.groups.tenders.indexOf(v.procedure_type)<0) {
        //  this.hideKey('peretorg_possible');
        //}
        if (v.procedure_type != Application.models.Procedure.type_ids.public_sale) {
          this.hideKey('step_reduction');
          this.hideKey('step_auction');
        }
        else {
          this.hideKey('offers_step_min');
          this.hideKey('offers_step_max');
          this.hideKeyForced('step_is_exact');
        }
        if (v.paper_form==false) {
          this.hideKey('paper_form');
        } else {
          v.paper_form = 'Да';
        }
      })
    }, this, {once: true});

  }
});

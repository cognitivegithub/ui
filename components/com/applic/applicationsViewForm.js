/**
 * Компонент рисует форму просмотра поданных заявок.
 * Параметры:
 * lot_id - идентификатор лота
 */
Ext.define('Application.components.applicationsViewForm', {
  extend: 'Ext.form.Panel',
  module: 'com',
  initComponent: function() {

    var component = this;
    var lot, procedure;
    var procedure_info_panel = Ext.id();
    var representative;
    if (component.filter == "representatives") {
        representative = true;
    }
    else {
        representative = false;
    }
    
    var rnp_text = '&nbsp;<a class="rnp_present" title="По состоянию на '+new Date().format('d.m.Y')+' данный участник находится в реестре недобросовестных поставщиков в соответствии со ст. 19 94-ФЗ. Информация из реестра недобросовестных поставщиков обновляется на электронной площадке 1 раз в день. Рекомендуем сверять информацию на сайте http://rnp.fas.gov.ru/"></a>';
    
    var store = new Ext.data.DirectStore({
      autoDestroy: true,
      autoLoad: false,
      root: 'applics',
      idProperty: 'app_id',
      autoSave: false,
      fields: ['id', 'app_id', 'supplier_id', 'supplier',
               {name: 'date', type: 'date', dateFormat: 'c'},
               'accepted', 'basis_text', 'order_number_assigned', 'price', 'status', 'rnp', 'rnp_url', 'step_full_name']
    });
    function supplier_renderer(value, meta, record) {
      if (record.data.rnp && record.data.rnp == true) {
        var rnp_look = '';
        if(record.data.rnp_url) {
          rnp_look = '&nbsp;<a class="rnp_look" href="' + record.data.rnp_url + '"></a>';
        }
        return value + rnp_text + rnp_look;
      } else {
        return value;
      }
    }

    var dataGridColumns = [{
      header: "Порядковый<br/>номер",
      id: 'id',
      dataIndex: 'id',
      width: 30
    }, {
      header: "Дата и время<br/>регистрации заявки",
      dataIndex: 'date',
      renderer: Ext.util.Format.dateRenderer('d.m.Y H:i'),
      width: 40
    }, {
      header: "Статус процедуры на момент подачи заявки",
      dataIndex: 'step_full_name',
      width: 40
    }, {
      header: "Заявитель",
      dataIndex: 'supplier',
      width: 50,
      renderer: function(v,m,r){return supplier_renderer(v, m, r)}
    }, {
      header: "Заявки",
      xtype: 'textactioncolumn',
      actionsSeparator: '<br/>',
      items: [{
        tooltip: 'Содержимое заявки',
        text: 'Содержимое заявки',
        newWindow: true,
        href: function(value, p, record) {
            if (component.filter == 'representatives') {
                    return String.format('#com/applic/view/id/{0}/lot_id/{1}/filter/{2}', record.get('app_id'), lot.id, component.filter);
                }
            else {
                    return String.format('#com/applic/view/id/{0}/lot_id/{1}', record.get('app_id'), lot.id);
                }
        }
      }, {
        tooltip: 'Аккредитационные сведения',
        text: 'Аккредитационные сведения заявителя',
        newWindow: true,
        isHidden: function(value, p, record) {
          return (record.get('supplier_id')!='') ? false : true;
        },
        href: function(value, p, record) {
         return String.format('#company/view/id/{0}/withProcuracyFiles/{1}', record.get('supplier_id'),1);
        }
      }]
    }, {
      header: "Статус заявки",
      dataIndex: 'status',
      width: 40
    }];

    component.grid = new Ext.grid.GridPanel({
        store: store,
        clicksToEdit: 1,
        cls: 'spaced-fieldset thinborder',
        cm: new Ext.grid.ColumnModel({
          columns: dataGridColumns
        }),
        viewConfig: {
          forceFit:true
        },
        autoHeight: true,
        hideTitle: true
    });

    Ext.apply(this, {
      title: 'Поданные заявки',
      fileUpload: true,
      border: true,
      frame:true,
      width: 900,
      items: [{
        xtype: 'fieldset',
        title: 'Общие сведения о процедуре',
        cls: 'spaced-fieldset',
        defaults: {bodyStyle: 'padding: 0px'},
        items: [{
          id: procedure_info_panel,
          hideTitle: true,
          border: false,
          cls: 'x-panel-mc',
          items: []
        }]},
        component.grid],
      buttons: [{
        text: 'Выгрузить список участников',
        handler: function() {
          var url = '/Applic/viewlist';
          var params = {
            lot_id: component.lot_id,
            viewlist_action: 'download',
            representative: representative,
            format: 'htmljson'
          };
          var dparams = {
            handle_failure: true,
            download: true,
            wait_disable: true
          };
          performAjaxRPCCall(url, params, dparams, echoResponseMessage);
        }
      }, {
        text: 'Закрыть',
        handler: function() {
          redirect_to(component.module + '/procedure/index');
        }
      }],
      listeners: {
        beforerender: function() {
          performRPCCall(RPC.Applic.viewlist, [{lot_id: component.lot_id, stage: component.stage, representative: representative}], {wait_delay: 0, wait_text: 'Загружаются заявки. Подождите...'}, function(result) {
            if (result.success) {
              lot = result.lot;
              procedure = result.procedure;
              component.proc_id = procedure.id;
              component.proc_type = procedure.procedure_type;

              var cm = component.grid.getColumnModel();
              if (component.proc_type == Application.models.Procedure.type_ids.public_sale) {
                var index = cm.findColumnIndex('step_full_name');
                cm.columns[index].hidden = true;
              }

              if (lot.date_published) procedure.date_published = lot.date_published;
              if (lot.date_end_registration) procedure.date_end_registration = lot.date_end_registration;
              if (lot.date_applic_opened) procedure.date_applic_opened = lot.date_applic_opened;
              // У нас лот только один + это ломало проверку заполненности регистрационного номера
              // procedure.registry_number = procedure.registry_number+', лот № '+lot.number;

              Ext.getCmp(procedure_info_panel).update(getProcedureDataTemplate().apply(Ext.apply(procedure)));

              component.applications = result.applications;

              store.loadData({applics: result.applications});
            } else {
              echoResponseMessage(result);
              redirect_to('com/procedure/index');
            }
          });
        }
      }
    });

    Application.components.applicationsViewForm.superclass.initComponent.call(this);
  }
});

Ext.define('Application.components.ProcedureProlongateForm', {
  extend: 'Ext.form.Panel',
  frame : false,
  border : false,
  initComponent : function () {
    var component = this;
    var date_published_id = Ext.id(),
      date_end_registration_id = Ext.id(),
      date_end_first_parts_review_id = Ext.id(),
      date_begin_auction_id = Ext.id(),
      date_applic_opened_id = Ext.id(),
      date_itog_id = Ext.id(),
      time_begin_auction_id = Ext.id();

    this.common_files_id = Ext.id();

    this.addEvents('procedurechanged');

    var datePanel = new Application.components.procedureBasicDates({
      title: 'Этапы проведения',
      frame: true,
      border: false,
      id: this.formId,
      hideDatePublished: true
    });
    datePanel.relayEvents(this, ['procedurechanged']);

    Ext.apply(this,
     {
      labelWidth: 300,
      frame: true,
      autoScroll: true,
      bodyCssClass: 'subpanel-top-padding',
      items : [{
        xtype: 'hidden',
        name: 'lot_id',
        value: component.lot_id
      },{
        xtype: 'hidden',
        name: 'procedure_id',
        value: component.procedure_id
      }, datePanel, {
        xtype: 'fieldset',
        title: 'Документация процедуры',
        items: [
          {
            html: 'Для размещения файлов документации загружайте их по одному с помощью формы ниже. '+
                  ACCEPTED_FILES+'.',
            cls: 'spaced-bottom-shallow'
          },
          {
            id: component.common_files_id,
            xtype: 'Application.components.multiuploadPanel',
            uploadHandler: RPC.Procedure.addFile,
            deleteHandler: RPC.Procedure.removeFile,
            name: 'common_files',
            simultaneousUpload: true,
            autoUpload: true,
            width: 750,
            listeners: {
              beforeupload: function(cmp) {
                cmp.uploadParams.procedure_id = component.procedure_id;
                cmp.uploadParams.type=3;
              }
            }
          }
        ]
      }
      ],
      buttons: [{
        text: 'Продлить срок подачи заявок',
        scope: this,
        formBind : true,
        handler: function() {
          var params = this.getValues();
          Ext.apply(params, {date_time: Ext.util.Format.localDateRenderer(new Date()).replace('&nbsp;', '')});
          if (params.time_begin_auction && params.date_begin_auction) {
              var time = params.time_begin_auction.split(':');
              params.date_begin_auction.setHours(time[0]);
              params.date_begin_auction.setMinutes(time[1]);
              params.date_begin_auction.setSeconds(0);
              params.date_begin_auction.setMilliseconds(0);
          }
          var adv_items = component.getHiddenFieldsByParams(params); 
          var win = new Application.components.promptWindow({
            title: 'Продление срока подачи заявок',
            cmpType: 'Application.components.SignatureForm',
            parentCmp: this,
            cmpParams: {
              api: RPC.Lot.prolongate,
              signatureText : component.getSignText(true, params.date_time),
              signatureTextHeight: 250,
              useFormHandler: false,
              items: adv_items,
              success_fn: function(resp) {
                win.close();
                Ext.Msg.alert('Успешно', 'Сроки лота изменены', function() {redirect_to('com/procedure/index');});
              }
            }
          });
          win.show();
        }
      }, {
        text: 'Рассмотреть заявки',
        scope: this,
        formBind: true,
        handler: function() {
          Ext.Msg.show({
            title: 'Отказ от продления срока подачи заявок',
            msg: 'Вы уверены что хотите отказаться? Возможности продлить срок подачи заявок больше не будет.',
            buttons: Ext.Msg.YESNO,
            closable: false,
            fn: function(b){
              if (b == 'yes') {
                var params = {
                  prolongate: false,
                  lot_id: component.lot_id,
                  date_time: Ext.util.Format.localDateRenderer(new Date()).replace('&nbsp;', '')
                };
                var adv_items = component.getHiddenFieldsByParams(params);
                var win = new Application.components.promptWindow({
                  title: 'Продление срока подачи заявок',
                  cmpType: 'Application.components.SignatureForm',
                  parentCmp: this,
                  cmpParams: {
                    api: RPC.Lot.prolongate,
                    signatureText : component.getSignText(false, params.date_time),
                    signatureTextHeight: 250,
                    useFormHandler: false,
                    items: adv_items,
                    success_fn: function(resp) {
                      win.close();
                      Ext.Msg.alert('Успешно', 'Лот переведен на следующий этап', function() {redirect_to('com/procedure/index');});
                    }
                  }
                });
                win.show();
              }
            }
          }, this);
        }
      }, {
        text: 'Закрыть',
        handler: function() {
          redirect_to('com/procedure/index');
        }
      }],
      listeners: {
        beforerender : function() {
          Ext.getBody().mask('Загружаем данные');
          RPC.Lot.loadLotDates(component.lot_id, function(resp) {
            if (resp.success) {
              var visible, i, item;

              if (component.prolongate) {
                component.setTitle('Решение о продлении срока приема заявок лота №'+resp.procedure.lot.number + ' процедуры '+resp.procedure.registry_number);
              } else {
                component.setTitle('Перевод сроков проведения лота №'+resp.procedure.lot.number + ' процедуры '+resp.procedure.registry_number);
              }

              component.procedure = resp.procedure;
              component.lot = resp.procedure.lot;
              component.procedure_type = resp.procedure.procedure_type;
              var type = Application.models.Procedure.type_ids[component.procedure_type];
              if(component.lot.steps && component.lot.steps!="[]") {
                component.steps = Ext.util.JSON.decode(component.lot.steps);
              }
              if(!component.steps || !component.steps.length) {
                component.steps = Application.models.Procedure.getType(component.procedure_type).steps;
              }
              component.fireEvent('procedurechanged', resp.procedure.procedure_type);

              setComponentValues(component, component.lot);
            } else {
              Ext.Msg.alert('Ошибка', resp.message);
            }
            Ext.getBody().unmask();
          });
        }
      },
      getValues: function() {
        var dt=null;
        var v = {};
        collectComponentValues(this, v, true);
        if (v.date_end_second_parts_review) {
          v.date_end_second_parts_review = v.date_end_second_parts_review.add(Date.MINUTE, 23*60 + 59);
        }
        return v;
      },
     /*
      * возвращает поля xtype - hidden, по свойствам и значениям переданного объекта объекта
      */
      getHiddenFieldsByParams: function(params) {
        var fields = [];
        for(var prop in params) {
          if (params.hasOwnProperty(prop)) {
            fields.push({
              xtype: 'hidden',
              name: prop,
              value: Ext.util.JSON.encode(params[prop])
            });
          }
        }
        return fields;
      },
     /**
      * @param bool prolongate - продлевать сроки
      * @param string date_time - время подписи
      * @return string sign_text - текст на подпись
      */
      getSignText: function(prolongate, date_time) {
        var operation = '';
        if (prolongate) {
          operation = 'продляю сроки приема заявок процедуры';
        } else {
          operation = 'отказываюсь от продления сроков процедуры';
        }
        var files_descr = '';
        var common_files = Ext.getCmp(this.common_files_id);
        var files_info = common_files.getFilesInfo();
        files_info.sort(function(a, b) {
          if (a.id > b.id) return -1;
          return 1;
        });
        for(var i = 0; i < files_info.length; i++) {
          files_descr += (i+1) + '. ' + files_info[i].descr + ' - ' + files_info[i].name
              + ' (контрольная сумма ГОСТ Р34.11-94: ' + files_info[i].hash + ')\n';
        }
        return 'Я, ' + Main.user.full_name + ', ' + operation
               + ' ' + this.procedure.registry_number + ' лот №' + this.procedure.lot.number + '. '
               + 'Дата и время: ' + date_time + '.\n'
               + (files_descr != '' ? 'Прикрепленные файлы документации процедуры:\n ' + files_descr : '');
      }
    });
    Application.components.ProcedureProlongateForm.superclass.initComponent.call(this);
  }
});

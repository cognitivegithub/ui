/**
 * @class Application.components.procedureEditForm
 * @extends Ext.tab.Panel
 *
 * Форма редактирования процедуры.
 *
 */
Ext.define('Application.components.procedureForm', {
  extend: 'Ext.tab.Panel',

  /**
   * @cfg {Boolean} editable
   * false для отключения редактирования. По-умолчанию true.
   * Используется когда компонент нужен только для просмотра данных.
   *
   * В настоящее время эта опция не используется!
   */


  // protected
  initComponent: function() {
    var component = this;

    this.formId = Ext.id();
    //var lotnum = 1;
    this.addEvents('procedurechanged', 'procedureloaded', 'onEditing', 'idchanged');
    
    this.ids = {
      docs: Ext.id(),
      delivery: Ext.id(),
      subject: Ext.id(),
      reqs: Ext.id(),
      pictures: Ext.id()
    };

    if ( !Ext.isBoolean(this.editable) )
      this.editable = true;
    
    var subject = new Application.components.subjectForm({
      title: 'Сведения о товаре',
      id: this.ids.subject,
      value: this.value,
      parent: this
    });

    var reqs = new Application.components.reqForm({
      title: 'Требования и критерии',
      id: this.ids.reqs,
      value: this.value
    });
    
    var stock_place = {
      title: 'Адрес местонахождения товара',
      xtype: 'Application.components.addressForm',
      value: this.value,
      id: this.ids.delivery
    };
    
    var doc_form = {
      title: 'Проект договора',
      name: 'lot_documentation',
      id: this.ids.docs,
      parent: this,
      xtype: 'Application.components.lotdocForm'
    };
    
    var pic_form = new Application.components.imageGalleryPanel ({
      title: 'Фото товара',
      id: this.ids.pictures,
      parent: this,
      procedure: this.procedure_id||false,
      editable: true
    });
    
    this.items = [
      {
        title: 'Общие сведения',
        xtype: 'Application.components.basicForm',
        id: this.formId,
        listeners: {
          beforerender: function(cmp) {
            component.relayEvents(cmp, ['procedurechanged']);
          }
        }
      },
      subject,
      pic_form,
      reqs,
      stock_place,
      doc_form
    ];

    this.listeners = this.listeners||{};

    Ext.apply(this.listeners, {
      idchanged: function(id) {
        component.procedure_id = id;
      }
    }); // listeners apply

    if (this.editable) {
      this.buttons = [{
        text: 'Сохранить',
        handler: function() {
          component.performSave();
        },
        scope: this
      }, {
        text: 'Подписать и опубликовать',
        handler: function() {
          var warn = [], warn_fatal = false;
          
          var valid = this.validate();
          if (true!==valid && !valid.success) {
            warn_fatal = warn_fatal||valid.fatal;
            warn.push(valid.msg);
          }
          
          function doSave() {
            component.performSave(function(){
              if (component.procedure_id) {
                redirect_to('tsn/procedure/sign/procedure/'+component.procedure_id);
              } else {
                Ext.Msg.alert('Ошибка', 'Почему-то отсутствует идентификатор процедуры. Попробуйте еще раз.');
              }
            });
          }
          if (warn.length) {
            warn = warn.join('<br/>\n');
            if (warn_fatal) {
              Ext.Msg.alert('Ошибка', warn);
              return;
            } else {
              Ext.Msg.confirm('Предупреждение', warn+'<br/>\nВы уверены что хотите опубликовать процедуру?', function(b){
                if ('yes'==b) {
                  doSave();
                }
              });
            }
          } else {
             Ext.Msg.confirm('Предупреждение', 'В соответствии с регламентом работы торговой площадки по реализации '+
              'неликвидного имущества за публикацию лота с Вашего лицевого счета, открытого для внесения обеспечений '+
              'заявок на участие в открытых аукционах на торговой площадке ОАО "ЕЭТП" будет списана оплата услуг ОАО "ЕЭТП" '+
              'в размере 10% от начальной цены публикуемого лота, но не менее '+Main.config.lot_publish_maxprice+' рублей<br/>\nВы уверены, что хотите опубликовать лот?', function(b){
                if ('yes'==b) {
                  doSave();
                }
             });
          }
        },
        scope: this
      }]; // buttons
    }

    Ext.apply(this, {
      activeTab: 0,
      enableTabScroll: true,
      defaults: {
        frame: true
      }

    });
    Application.components.procedureForm.superclass.initComponent.call(this);
    if (this.value) {
      autoSetValue(this);
    }
    
    subject.relayEvents(this, ['procedurechanged','onEditing','procedureloaded', 'idchanged']);
    reqs.relayEvents(this, ['procedurechanged']);
    pic_form.relayEvents(this, ['idchanged']);
    this.relayEvents(subject, ['startpricechanged']);
    
    if (this.procedure_id) {
      this.on('afterrender', function(){
        var params = {
          mask: true,
          mask_el: this.getEl(),
          scope: this
        };

        var p = {procedure_id: this.procedure_id, lot_id: this.lot_id};
        performRPCCall(RPC_tsn.Procedure.loaddraft, [p], params,function(resp) {
          if (resp && resp.success) {
            this.setValues(resp.procedure);          
          } else if (resp) {
            echoResponseMessage(resp);
          }
        });
      }, this, {once: true});
    }
  },
  /**
   *
   * @param {Function} callback Callback
   */
  performSave: function(callback) {
    var component = this;
    performRPCCall(RPC_tsn.Procedure.save, [this.getValues()], null, function(result) {
      if (result.success) {
        if (result.procedure) {
          component.fireEvent('idchanged', result.procedure.id);
          component.setValues(result.procedure);          
        } else if (result.procedure_id) {
          component.fireEvent('idchanged', result.procedure_id);
        }
        if ( Ext.isFunction(callback) ) {
          callback(result);
        }
      } else {
        echoResponseMessage(result);
      }
    }); // RPC_tsn.Procedure.save
  }, // performSave method


  /**
   * Получает данные компонента.
   * @return {Object} values
   */
  getValues: function() {
    var values={};
    
    collectComponentValues(this, values, true);
    
    if(this.procedure_id) {
      values.id = this.procedure_id;
    }
    if(this.lot_id) {
      values.lot_id = this.lot_id;
    }
    if(this.lot_unit_id) {
      values.lot_unit_id = this.lot_unit_id;
    }
    return values;
  }, // getValues method


  /**
   * Задаёт данные компонента.
   * @param {Object} v Объект данных.
   * @return {Application.components.procedureForm} this
   */
  setValues: function(v) {
    this.procedure_id = v.id;
    this.procedure = v;
    if(v.lot_id) {
      this.lot_id = v.lot_id;
    }
    if(v.lot_unit_id) {
      this.lot_unit_id = v.lot_unit_id;
    }
    setComponentValues(this, v, true);
    
    //Ext.getCmp(this.formId).setValues(v);
    
    /*if (v.address&&!Ext.isEmpty(v.address)) {
      Ext.getCmp(this.ids.delivery).setValues(v);
    }*/

    Ext.getCmp(this.ids.subject).setValues(v);
    Ext.getCmp(this.ids.pictures).setValues(v.lot_unit_pictures);
    //Ext.getCmp(this.ids.reqs).setValues(v);
    //Ext.getCmp(this.ids.delivery).loadData(v.address);
    this.fireEvent('procedurechanged', v.procedure_type);
    
    return this;
  }, // setValues method
  validate: function() {
    var valid = {success: true, msg: []};
    var docs = {};
    collectComponentValues(Ext.getCmp(this.ids.docs), docs);
    if (!docs.lot_documentation || !docs.lot_documentation.length) {
      valid.msg.push('У лота отсутствует документация.');
      valid.success = false;
    }
    valid.msg = valid.msg.join('<br/>\n');
    return valid;
  }
});

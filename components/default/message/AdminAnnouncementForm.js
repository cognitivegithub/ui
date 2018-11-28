/**
 * Форма редактирования объявления для всех.
 */
Ext.define('Application.components.AdminAnnouncementForm', {
  extend        : 'Ext.form.Panel',
  frame         : true,
  border        : false,
  autoHeight    : true,
  layout        : 'form',
  bodyStyle     : 'padding: 5px 5px 0 5px;',
  labelAlign    : 'top',

  initComponent : function () {
    var component = this;

    this.TYPE_ALL = 'ALL';
    this.TYPE_DEPARTMENT = 'DEPARTMENT';
    this.TYPE_PERSONAL = 'PERSONAL';

    this.ids = {
      type: Ext.id(),
      notify_department: Ext.id(),
      notify_user: Ext.id(),
      instantly: Ext.id(),
      date_start: Ext.id(),
      permanently: Ext.id(),
      date_end: Ext.id()
    };

    var date = now();
    var minutesDifference = 15;
    var minutes = date.getMinutes()/minutesDifference == 0 ? date.getMinutes() + minutesDifference : date.getMinutes();
    var startMin = (Math.ceil(minutes/minutesDifference) * minutesDifference);
    var startHours = (date.getHours() + startMin/60);
    startMin = startMin % 60;
    var dateStart = now();
    dateStart.setHours(startHours);
    dateStart.setMinutes(startMin);
    var dateEnd = new Date(dateStart.getTime() + minutesDifference*60000);

    if (component.messageId) {
      RPC.Message.load(component.messageId, function(result) {
        if (result.success) {
          var messageData = result.data;
          component.getForm().setValues(messageData);

          component.messageDateStart = parseDate(result.data.date_start);
          component.messageDateEnd = parseDate(result.data.date_end);

          Ext.getCmp(component.ids.instantly).setValue(result.data.date_start ? false : true);
          Ext.getCmp(component.ids.date_start).setValue(result.data.date_start ?
            component.messageDateStart :
            dateStart
          );
          Ext.getCmp(component.ids.permanently).setValue(result.data.date_end ? false : true);
          Ext.getCmp(component.ids.date_end).setValue(result.data.date_end ?
            component.messageDateEnd :
            dateEnd
          );
        } else {
          Ext.Msg.alert('Ошибка', result.message);
        }
      });
    }

    this.items = [{
      xtype: 'fieldset',
      columnWidth: .45,
      frame: false,
      border: true,
      title: 'Видимость сообщения',
      items: [{
        xtype       : 'radiogroup',
        itemCls     : 'x-check-group-alt',
        hideLabel   : true,
        columns     : 1,
        id          : this.ids.type,
        items       : [{
          columnWidth: '1',
          items: [
            {boxLabel: 'Всем пользователям', checked: true, inputValue: component.TYPE_ALL, name: 'type', width: 140, height: 22}
          ]
        },{
          columnWidth: '1',
          layout: 'hbox',
          items: [
            {boxLabel: 'Подразделению:', inputValue: component.TYPE_DEPARTMENT, name: 'type', width: 140, height: 30},
            {
              xtype: 'combo',
              id: this.ids.notify_department,
              name: 'notify_department_id',
              hideLabel   : true,
              mode: 'local',
              flex: 1,
              store : createDepartmentsForSearchStore(),
              editable: true,
              valueField: 'id',
              displayField: 'name',
              hiddenName : 'notify_department_id',
              triggerAction: 'all',
              maxHeight: 200,
              disabled: true,
              listeners: {
                beforerender: function() {
                  var store = this.getStore();
                  store.on('load', function(){
                    if (this.value) {
                      this.setValue(this.value);
                    }
                  }, this, {single: true});
                }
              }
            }
          ]
        },{
          columnWidth: '1',
          layout: 'hbox',
          items: [
            {boxLabel: 'Пользователю:', inputValue: component.TYPE_PERSONAL, name: 'type', width: 140},
            {
              xtype: 'combo',
              id: component.ids.notify_user,
              name: 'notify_user_id',
              hideLabel   : true,
              mode: 'local',
              flex: 1,
              store: createUsersForSearchStore(),
              editable: true,
              valueField: 'id',
              displayField: 'member_fio',
              hiddenName : 'notify_user_id',
              triggerAction: 'all',
              maxHeight: 200,
              disabled: true,
              listeners: {
                beforerender: function() {
                  var store = this.getStore();
                  store.on('load', function(){
                    if (this.value) {
                      this.setValue(this.value);
                    }
                  }, this, {single: true});
                }
              }
            }
          ]
        }],
        listeners   : {
          change: function(group, checked) {
            var depCmp = Ext.getCmp(component.ids.notify_department);
            var userCmp = Ext.getCmp(component.ids.notify_user);
            switch (checked.inputValue) {
              case component.TYPE_ALL:
                depCmp.setDisabled(true);
                userCmp.setDisabled(true);
                break;
              case component.TYPE_DEPARTMENT:
                depCmp.setDisabled(false);
                userCmp.setDisabled(true);
                break;
              case component.TYPE_PERSONAL:
                depCmp.setDisabled(true);
                userCmp.setDisabled(false);
                break;
            }
          }
        }
      }]
    }, {
      xtype: 'fieldset',
      columnWidth: .45,
      frame: false,
      border: true,
      title: 'Срочность сообщения',
      items: [{
        xtype: 'container',
        layout: 'hbox',
        height: 30,
        items: [{
          width: 300,
          xtype: 'label',
          style: 'padding-top: 4px;',
          html: 'Дата и время начала вывода сообщения'
        }, {
          flex: 1,
          xtype: 'checkbox',
          checked: true,
          name: 'instantly',
          boxLabel: 'Моментально',
          id: component.ids.instantly,
          listeners   : {
            check: function(group, checked) {
              Ext.getCmp(component.ids.date_start).setDisabled(checked);
            }
          }
        }, {
          flex: 1,
          hideLabel   : true,
          xtype: 'Application.components.datetimeField',
          id: component.ids.date_start,
          cmp_id: 'notify_start',
          format: 'd.m.Y H:i',
          altFormats: 'd.m.Y H:i',
          anchor: null,
          name: 'notify_start',
          value: dateStart,
          minValue: new Date(),
          disabled: true
        }]
      }, {
        xtype: 'container',
        layout: 'hbox',
        height: 30,
        items: [{
          width: 300,
          xtype: 'label',
          style: 'padding-top: 4px;',
          html: 'Дата и время окончания вывода сообщения'
        }, {
          flex: 1,
          xtype: 'checkbox',
          checked: true,
          name: 'permanently',
          boxLabel: 'Без срока',
          id: component.ids.permanently,
          listeners   : {
            check: function(group, checked) {
              Ext.getCmp(component.ids.date_end).setDisabled(checked);
            }
          }
        }, {
          flex: 1,
          hideLabel   : true,
          xtype: 'Application.components.datetimeField',
          id: component.ids.date_end,
          cmp_id: 'notify_end',
          format: 'd.m.Y H:i',
          altFormats: 'd.m.Y H:i',
          anchor: null,
          name: 'notify_end',
          value: dateEnd,
          minValue: new Date(),
          disabled: true
        }]
      }]
    }, {
      xtype       : 'textarea',
      anchor      : '100%',
      name        : 'content',
      ref         : 'content',
      fieldLabel  : 'Текст сообщения' + REQUIRED_FIELD,
      allowBlank  : false
    }];

    this.buttons = [{
      text: 'Отмена',
      handler: function() {
        history.back(1);
      }
    }, {
      text      : 'Сохранить',
      scope     : this,
      formBind  : true,

      handler   : function(button) {
        var form = this.getForm();
        var values = form.getValues();
        values.id = component.messageId;

        var data = component.validate(values);

        if (data.isValid) {
          performRPCCall(RPC.Message.edit, [values], {mask_el: this.getEl()}, function(resp) {
            if(resp && resp.success) {
              Ext.MessageBox.alert('Успех', 'Сообщение сохранено');

              redirect_to('message/list');
            } else {
              Ext.MessageBox.alert('Ошибка', resp.message);
            }
          });
        } else {
          Ext.MessageBox.alert('Ошибка', data.msg.join('</br>'));
        }
      }
    }];

    Application.components.AdminAnnouncementForm.superclass.initComponent.call(this);
  }, // initComponent
  validate: function(values) {
    var result = {
      isValid: true,
      msg: []
    };
    var now = new Date();
    switch (values.type) {
      case this.TYPE_DEPARTMENT:
        if (!values.notify_department_id) {
          result.isValid = false;
          result.msg.push("Не задано <b>уведомляемое подразделение</b>");
        }
        break;
      case this.TYPE_PERSONAL:
        if (!values.notify_user_id) {
          result.isValid = false;
          result.msg.push("Не задан <b>уведомляемый пользователь</b>");
        }
        break;
    }

    var dateStart = values.notify_start_date;
    var timeStart = values.notify_start_time;
    var dateTimeStart = null;
    if (!values.instantly) {
      if (!dateStart || !timeStart) {
        result.isValid = false;
        if (!dateStart && !timeStart) {
          result.msg.push("Не заданы <b>дата</b> и <b>время начала</b> вывода сообщения");
        } else if (!dateStart) {
          result.msg.push("Не задана <b>дата начала</b> вывода сообщения");
        } else if (!timeStart) {
          result.msg.push("Не задано <b>время начала</b> вывода сообщения");
        }
      } else {
        dateTimeStart = parseDate(dateStart.split('.').reverse().join('-') + ' ' + timeStart);
        var isEqualStart = Ext.isEmpty(this.messageDateEnd) ? true : this.compareDates(dateTimeStart, this.messageDateStart) != 0;
        if (isEqualStart && dateTimeStart < now) {
          result.isValid = false;
          result.msg.push("<b>Время начала</b> вывода сообщения не может быть задано на прошедшее время");
        }
      }
    }

    var dateEnd = values.notify_end_date;
    var timeEnd = values.notify_end_time;
    var dateTimeEnd = null;
    if (!values.permanently) {
      if (!dateEnd || !timeEnd) {
        result.isValid = false;
        if (!dateEnd && !timeEnd) {
          result.msg.push("Не заданы <b>дата</b> и <b>время окончания</b> вывода сообщения");
        } else if (!dateEnd) {
          result.msg.push("Не задана <b>дата окончания</b> вывода сообщения");
        } else if (!timeEnd) {
          result.msg.push("Не задано <b>время окончания</b> вывода сообщения");
        }
      } else {
        dateTimeEnd = parseDate(dateEnd.split('.').reverse().join('-') + ' ' + timeEnd);
        var isEqualEnd = Ext.isEmpty(this.messageDateEnd) ? true : this.compareDates(dateTimeEnd, this.messageDateEnd) != 0;
        if (isEqualEnd && dateTimeEnd < now) {
          result.isValid = false;
          result.msg.push("<b>Время окончания</b> вывода сообщения не может быть задано на прошедшее время");
        }
      }
    }

    if (!values.instantly && !values.permanently && dateTimeStart && dateTimeEnd) {
      if (dateTimeStart >= dateTimeEnd) {
        result.isValid = false;
        result.msg.push("<b>Дата и время окончания</b> вывода сообщения должны быть больше <b>даты и времени начала</b>.");
      }

    }

    if (!values.content) {
      result.isValid = false;
      result.msg.push("Не задан <b>текст сообщения</b>");
    }

    return result;
  },
  compareDates: function(date1, date2) {
    date1.setSeconds(0);
    date2.setSeconds(0);
    var timems1 = date1.getTime();
    var timems2 = date2.getTime();
    return timems1 - timems2;
  }

}); // Application.components.AdminAnnouncementForm
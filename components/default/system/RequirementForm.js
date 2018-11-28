/**
 * Форма для присваивания значений
 */
Application.components.RequirementForm = Ext.extend(Ext.form.FormPanel, {
  layout: 'form',
  /**
   * Инициализация.
   * @return {void}
   */
  initComponent : function () {
    var component = this;
    var cmp_width = 800;

    var formElem = [
      {
        xtype: 'textarea',
        fieldLabel: 'Критерии оценки заявки участника процедуры размещения заказа' + REQUIRED_FIELD,
        name: 'name',
        hiddenName: 'name',
        allowBlank: false,
        width: 600,
        listWidth: 600,
        mode: 'local',
        value: component.itemName
      },
      {
        xtype: 'numberfield',
        fieldLabel: 'Код' + REQUIRED_FIELD,
        name: 'code',
        hiddenName: 'code',
        allowBlank: false,
        mode: 'local',
        value: component.itemCode
      },
      {
        xtype: 'checkbox',
        fieldLabel: 'Актуально',
        name: 'actual',
        hiddenName: 'actual',
        allowBlank: true,
        mode: 'local',
        checked: component.itemActual
      },
      {
        xtype: 'hidden',
        name: 'id',
        value: component.itemId
      }
    ];
    var i = 0;
    Ext.each(component.requirements, function(elem){
      var id = i;
      formElem.push({
        xtype: 'displayfield',
        width: 600,
        html: '<div style="margin-top: 20px; margin-bottom: 5px"><b>Вариация:</b></div>',
        id: id + '_display'
      });
      formElem.push({
        xtype     : 'textarea',
        fieldLabel: 'Требования Организатора закупки к участникам процедуры заказа' + REQUIRED_FIELD,
        name: 'req_name[' + i + ']',
        value: elem.name,
        width: 600,
        height: 100,
        allowBlank: false,
        id: id + '_name'
      });
      formElem.push({
        xtype     : 'textarea',
        fieldLabel: ('Документы, подтверждающие соответствие' +
        ' Участника процедуры размещения заказа требованиям Организатора закупки' + REQUIRED_FIELD),
        name: 'req_description[' + i + ']',
        value: elem.description,
        width: 600,
        height: 300,
        allowBlank: false,
        style: 'margin-top: 30px',
        id: id + '_description'
      });
      formElem.push({
        xtype: 'checkbox',
        fieldLabel: 'Актуально',
        name: 'req_actual[' + i + ']',
        hiddenName: 'actual',
        allowBlank: true,
        mode: 'local',
        checked: elem.actual,
        id: id + '_actual'
      });
      formElem.push({
        xtype: 'hidden',
        name: 'req_id[' + i + ']',
        value: elem.id,
        id: id + '_id'
      });
      formElem.push({
        xtype: 'button',
        text: 'Удалить',
        id: id + '_button',
        handler: function() {
          component.remove(id + '_id');
          component.remove(id + '_actual');
          component.remove(id + '_description');
          component.remove(id + '_name');
          component.remove(id + '_display');
          component.remove(id + '_button');
          component.doLayout();
        }
      });
      i++;
    });
    Ext.apply(this, {
      bodyCssClass: 'subpanel-top-padding',
      bodyStyle: 'padding-right: 6px',
      width: cmp_width,
      frame: true,
      title: 'Требование',
      items: formElem,
      buttons: [{
        text: 'Вернуться к списку',
        handler: function() {
          redirect_to('admin/requirements')
        },
        scope: this
      },{
        text: 'Добавить вариацию',
        handler:  function() {
          var form = component.getForm();
          var maxId = component.requirements.length;
          window.form = form;
          var id = maxId;
          component.add(
            {
              xtype: 'displayfield',
              width: 600,
              html: '<div style="margin-top: 20px; margin-bottom: 5px"><b>Вариация:</b></div>',
              id: id + '_display'
            },
            {
              xtype     : 'textarea',
              fieldLabel: 'Требования Организатора закупки к участникам процедуры заказа' + REQUIRED_FIELD,
              name: 'req_name[' + maxId + ']',
              width: 600,
              height: 100,
              allowBlank: false,
              id: id + '_name'
            },
            {
              xtype     : 'textarea',
              fieldLabel: ('Документы, подтверждающие соответсвие' +
              ' Участника процедуры размещения заказа требованиям Организатора закупки' + REQUIRED_FIELD),
              name: 'req_description[' + maxId + ']',
              width: 600,
              height: 300,
              allowBlank: false,
              style: 'margin-top: 30px',
              id: id + '_description'
            },
            {
              xtype: 'checkbox',
              fieldLabel: 'Актуально',
              name: 'req_actual[' + maxId + ']',
              allowBlank: true,
              mode: 'local',
              checked: true,
              id: id + '_actual'
            },
            {
              xtype: 'hidden',
              name: 'req_id[' + maxId + ']',
              id: id + '_id'
            },
            {
              xtype: 'button',
              text: 'Удалить',
              id: id + '_button',
              handler: function() {
                component.remove(id + '_id');
                component.remove(id + '_actual');
                component.remove(id + '_description');
                component.remove(id + '_name');
                component.remove(id + '_display');
                component.remove(id + '_button');
                component.doLayout();
              }
            }
          );
          component.requirements.push({
            name: '',
            description: '',
            actual: true,
            id: ''
          });
          component.doLayout();
        },
        scope: this
      }, {
        text: 'Сохранить',
        scope: this,
        formBind : true,
        handler: function() {
          if (component.getForm().isValid()) {
            performRPCCall(component.api, [component.getForm().getValues()], {}, function(resp) {
              if (resp && resp.success) {
                Ext.Msg.alert('Успешно', 'Требование обновлено!');
                component.success_fn();
              } else if (resp && resp.message) {
                Ext.Msg.alert('Ошибка', resp.message);
              } else {
                Ext.Msg.alert('Ошибка', 'При сохранении возникла ошибка');
              }
            })
          }
        }
      }]
    });

    Application.components.RequirementForm.superclass.initComponent.call(this);
    this.form.api = {
      submit: component.api
    };
  }
});
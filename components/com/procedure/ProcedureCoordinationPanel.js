Ext.define('Application.components.ProcedureCoordination', {
  extend: 'Ext.form.FieldSet',
  frame : false,
  border : true,
  initComponent : function () {
    var component = this;

    var coordination_id = Ext.id(),
        resolved_id = Ext.id(),
        declined_id = Ext.id(),
        coordination_status_id = Ext.id(),
        old_coordination_status_id = Ext.id();

    Ext.apply(this, {
      layout : 'form',
      labelWidth: 1,
      items: [{
        xtype: 'hidden',
        name: 'old_coordination_status',
        id: old_coordination_status_id,
        value: null
      }, {
        xtype: 'hidden',
        name: 'coordination_status',
        id: coordination_status_id,
        setValues: function(coordination_status) {
          // сохраняем первоначальный статус согласования
          Ext.getCmp(old_coordination_status_id).setValue(coordination_status);

          // Определяем чек боксы согласования в зависимости от текущего статуса согласования процедуры
          // и роли текущего пользователя в отделе

          // если в извещение зашел пользователь другого отдела, то скрываем функционал согласования
          if (component.parent.procedure_organizer_department_id != Main.user.department_id) {
            component.setVisible(false);
            return;
          }
          var coordination = Ext.getCmp(coordination_id);
          var resolved = Ext.getCmp(resolved_id);
          var declined = Ext.getCmp(declined_id);
          coordination.setDisabled(true);
          resolved.setDisabled(true);
          declined.setDisabled(true);

          if (Main.user.department_role_id == DEPARTMENT_ROLE_SPECIALIST
                && (!coordination_status || coordination_status == COORDINATION_STATUS_DECLINED)) {
            // Если пользователь - эксперт и статус согласования не указан или отклонен,
            // значит можно отправить на согласование
            coordination.setDisabled(false);

          } else if (Main.user.department_role_id == DEPARTMENT_ROLE_HEAD
                && coordination_status == COORDINATION_STATUS_COORDINATION) {
            // Если пользователь - начальник и статус на согласовании,
            // значит можно либо согласовать либо отклонить
            coordination.setValue(true);
            resolved.setVisible(true);
            resolved.setDisabled(false);
            declined.setVisible(true);
            declined.setDisabled(false);

          } else if (coordination_status == COORDINATION_STATUS_COORDINATION) {
            // Если пользователь - НЕ начальник и статус на согласовании,
            // то можем это только увидеть
            coordination.setValue(true);
            resolved.setVisible(true);

          } else if (coordination_status == COORDINATION_STATUS_RESOLVED) {
            // Если статус согласовано, то можем это только увидеть
            coordination.setValue(true);
            resolved.setVisible(true);
            resolved.setValue(true);
          }

        },
        getValues: function() {
          var coordination = Ext.getCmp(coordination_id).getValue();
          var resolved = Ext.getCmp(resolved_id).getValue();
          var declined = Ext.getCmp(declined_id).getValue();
          var coordination_status = null;

          if (coordination && !resolved && !declined) {
            coordination_status = COORDINATION_STATUS_COORDINATION;
          }

          if (coordination && resolved) {
            coordination_status = COORDINATION_STATUS_RESOLVED;
          }

          if (coordination && declined) {
            coordination_status = COORDINATION_STATUS_DECLINED;
          }
          return coordination_status;
        }
      }, {
        xtype: 'checkbox',
        id: coordination_id,
        disabled: true,
        boxLabel: 'Направить на согласование',
        listeners: {
          check: function() {
            component.updateCoordinationStatus();
          }
        }
      }, {
        xtype: 'checkbox',
        id: resolved_id,
        disabled: true,
        hidden: true,
        boxLabel: 'Отметка о согласовании',
        listeners: {
          check: function(obj, checked) {
            var declined = Ext.getCmp(declined_id);
            if (checked && declined.getValue()) {
              declined.setValue(false);
            }
            component.updateCoordinationStatus();
          }
        }
      }, {
        xtype: 'checkbox',
        id: declined_id,
        disabled: true,
        hidden: true,
        boxLabel: 'Не согласовано',
        listeners: {
          check: function(obj, checked) {
            var resolved = Ext.getCmp(resolved_id);
            if (checked && resolved.getValue()) {
              resolved.setValue(false);
            }
            component.updateCoordinationStatus();
          }
        }
      }],
      updateCoordinationStatus: function() {
        var coordination_status = Ext.getCmp(coordination_status_id);
        coordination_status.setValue(coordination_status.getValues());
      },
      listeners: {
      }
    });
    Application.components.ProcedureCoordination.superclass.initComponent.call(this);
  }
});

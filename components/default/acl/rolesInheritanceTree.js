
Ext.define('Application.components.rolesInheritanceTree', {
  extend: 'Ext.tree.TreePanel',
  editable: true,
  autoHeight: true,
  frame: true,
  border: false,
  initComponent: function() {
    var component = this;
    var roles_store = getRolesStore();
    var data_ready = false;

    this.addEvents('inheritanceupdated');

    var reloadTree = (function() {
      if (this.inRescan) {
        return;
      }
      this.getLoader().load(this.getRootNode());
    }).createDelegate(this);

    var inheritance_ids = {};

    var inheritances_store = new Ext.data.DirectStore({
      autoDestroy: true,
      autoLoad: true,
      api: {
        read    : RPC.Acl.roleInheritanceIndex,
        create  : RPC.Acl.roleInheritanceUpdate,
        update  : RPC.Acl.roleInheritanceUpdate,
        destroy : RPC.Acl.roleInheritanceDelete
      },
      writer: new Ext.data.JsonWriter({encode: false, writeAllFields : true}),
      autoSave: false,
      idProperty: 'id',
      paramsAsHash: true,
      root: 'roles',
      fields: ['id', 'name', 'parent_role_id', 'child_role_id'],
      listeners: {
        load: function(store, data) {
          if (component.inRescan) {
            return;
          }
          inheritance_ids = {};
          this.each(function(r){
            if (r.data.id) {
              inheritance_ids[r.data.parent_role_id+'_'+r.data.child_role_id] = r.data.id;
            }
          });
          reloadTree();
          data_ready = true;
        },
        save: function() {
          this.reload();
        }
      }
    });
    roles_store.on('load', reloadTree);
    roles_store.on('save', reloadTree);

    function rescanInheritances(component, skip_existing) {
      if (component.inRescan || !data_ready) {
        return;
      }
      skip_existing = (true===skip_existing);
      component.inRescan = true;
      var data = [];
      var scanned = {};
      var node = component.getRootNode();

      function scan(node) {
        var parent_id = node.attributes.roleId;
        node.eachChild(function(n){
          var child_id = n.attributes.roleId;
          var key = parent_id+'_'+child_id;
          if (scanned[key]) {
            return;
          }
          scanned[key] = true;
          data.push({
            id: inheritance_ids[key],
            parent_role_id: parent_id,
            child_role_id: child_id
          });
          scan(n);
        });
      }

      node.eachChild(function(n){
        scan(n);
      });
      var todelete = [];
      for (var i in inheritance_ids) {
        if (!inheritance_ids.hasOwnProperty(i)) {
          continue;
        }
        if (scanned[i]) {
          continue;
        }
        var ids = i.split('_');
        data.push({
          id: inheritance_ids[i],
          parent_role_id: Number(ids[0]),
          child_role_id: Number(ids[1])
        });
        if (skip_existing) {
          todelete.push(i);
        }
      }
      var todelete_objs = [];
      inheritances_store.loadData({roles: data});
      inheritances_store.each(function(i){
        if (skip_existing && todelete.indexOf(i.data.parent_role_id+'_'+i.data.child_role_id)>=0) {
          todelete_objs.push(i);
        } else if (!i.data.id && !i.dirty) {
          i.beginEdit();
          i.markDirty();
          i.endEdit();
        }
      });
      for (i=0; i<todelete_objs.length; i++) {
        inheritances_store.remove(todelete_objs[i]);
      }
      component.inRescan = false;
    }

    var prepareRoleNode = function(role) {
      /*var leaf = true;
      store.each(function(r){
        if (r.data.parent_role_id == role.data.id) {
          leaf = false;
          return false;
        }
      });*/
      var id;
      if (role.data.child_role_id) {
        id = 'i_'+role.data.id+'_role_'+role.data.child_role_id;
        var role = roles_store.findExact('id', role.data.child_role_id);
        if (role<0) {
          return;
        }
        role = roles_store.getAt(role);
      } else {
        id = 'role_'+role.data.id;
      }
      var icon = 'user';
      if (!role.data.actual) {
        icon = 'user_gray';
      } else if (role.data.operator_role) {
        icon = 'user_suit';
      } else if (role.data.supplier_role && role.data.customer_role) {
        icon = 'user_orange';
      } else if (role.data.supplier_role) {
        icon = 'user_green';
      } else if (role.data.customer_role) {
        icon = 'user_red';
      }
      return {
        leaf: false,
        expanded: true,
        iconCls: 'icon-silk-'+icon,
        text: role.data.name,
        roleId: role.data.id,
        id: id
      };
    };


    var treeLoader = new Ext.tree.TreeLoader({
      preloadChildren: true,
      directFn: function(path, callback) {
        var roles = [];
        if ('root'==path) {
          roles_store.each(function(r) {
            if (inheritances_store.findExact('child_role_id', r.data.id)>=0) {
              return;
            }
            var node = prepareRoleNode(r);
            if (node) {
              roles.push(node);
            }
          });
        } else {
          path = path.match(/role_(\d+)$/);
          if (path && path[1]) {
            path = Number(path[1]);
            inheritances_store.each(function(r) {
              if (r.data.parent_role_id!=path) {
                return;
              }
              var node = prepareRoleNode(r);
              if (node) {
                roles.push(node);
              }
            });
          }
        }
        //console.log('Roles for '+path);
        //console.dir(roles);
        roles.sort(function(a,b){
          if (a.roleId<b.roleId) {
            return -1;
          } else if (a.roleId==b.roleId) {
            return 0
          }
          return 1;
        });
        callback(roles, {status: true});
      }
    });

    Ext.apply(this, {
      autoScroll: true,
      animate: false,
      enableDD: true,
      dropConfig: {
        ddGroup: 'acl_roles',
        allowContainerDrop: true,
        appendOnly: true
      },
      dragConfig: {
        ddGroup: 'acl_roles'
      },
      root: {
        draggable: false,
        leaf: false,
        id: 'root',
        text: 'Роли'
      },
      rootVisible: false,
      loader: treeLoader,
      bbar: [{
        text: 'Сохранить',
        cls:'x-btn-text-icon',
        icon: 'ico/database_save.png',
        handler: function(){
          rescanInheritances(component, true);
          inheritances_store.save();
        }
      }, {
        text: 'Отменить',
        cls:'x-btn-text-icon',
        icon: 'ico/undo.png',
        handler: function(){
          inheritances_store.reload();
        }
      }, '->', {
        iconCls: 'x-tbar-loading',
        handler: function() {
          inheritances_store.reload();
        }
      }]
    });
    Application.components.rolesInheritanceTree.superclass.initComponent.call(this);
    this.on('inheritanceupdated', function(){
      inheritances_store.reload();
    });
    this.on('beforenodedrop', function(drop){
      if (!drop.dropNode && drop.data && drop.data.selections && drop.data.selections[0]) {
        var row = drop.data.selections[0];
        drop.cancel = false;
        var node = prepareRoleNode(row);
        drop.dropNode = this.getRootNode().appendChild(node);
      }
    });
    this.on('nodedragover', function(drop){
      var role;
      if (!drop || !drop.data || !drop.target) {
        return false;
      }
      if (drop.data.node && drop.data.node.attributes && drop.data.node.attributes.roleId) {
        role = drop.data.node.attributes.roleId;
      } else if (drop.data.selections && drop.data.selections[0]) {
        role = drop.data.selections[0].data.id;
      }
      if (!role) {
        return false;
      }
      var node = drop.target;
      var parents = [];
      while (node) {
        parents.push(node.attributes.roleId);
        node = node.parentNode;
      }
      if (parents.indexOf(role)>=0) {
        return false;
      }
      var checked = [role];
      function getChildsFor(role) {
        var childs = [];
        inheritances_store.each(function(r) {
          if (r.data.parent_role_id!=role) {
            return;
          }
          childs.push(r.data.child_role_id);
        });
        return childs;
      }
      function checkChildsFor(role) {
        var childs = getChildsFor(role);
        for (var i=0; i<childs.length; i++) {
          var c = childs[i];
          if (checked.indexOf(c)>=0) {
            continue;
          }
          if (parents.indexOf(c)>=0) {
            return false;
          }
          checked.push(c);
          if (!checkChildsFor(c)) {
            return false;
          }
        }
        return true;
      }
      return checkChildsFor(role);
    });
    this.on('insert', rescanInheritances);
    this.on('append', rescanInheritances);
    this.on('movenode', rescanInheritances);
    this.on('remove', rescanInheritances);
    this.on('startdrag', function(){
      if (!this.trashDropTarget) {
        this.trashDropTarget = new Ext.Panel({
          width: 112,
          height: 101,
          floating: true,
          frame: true,
          border: false,
          cls: 'x-unselectable',
          bodyStyle: 'background: url(/images/trash_bin.png) no-repeat center bottom;',
          html: '&nbsp;',
          listeners: {
            show: function(panel) {
              var box = component.getBox();
              panel.setPosition(box.x+box.width-120, box.y+box.height-120);
              component.trashDropTargetDD = new Ext.dd.DropTarget(panel.getEl(), {
                ddGroup: 'acl_roles',
                notifyDrop: function(src, ev, data) {
                  if (data && data.node && data.node.remove) {
                    data.node.remove();
                  }
                  return true;
                }
              });
            }
          }
        });
        this.trashDropTarget.render(Ext.getBody());
      }
      this.trashDropTarget.show();
    }, this);
    this.on('enddrag', function(){
      if (this.trashDropTarget) {
        this.trashDropTarget.hide();
        if (component.trashDropTargetDD) {
          component.trashDropTargetDD.destroy();
        }
      }
    }, this);
    //this.on('dragdrop', rescanInheritances);
    this.on('destroy', function(){
      roles_store.un('load', reloadTree);
      roles_store.un('save', reloadTree);
      if (this.trashDropTarget) {
        this.trashDropTarget.destroy();
      }
    });
  }
});

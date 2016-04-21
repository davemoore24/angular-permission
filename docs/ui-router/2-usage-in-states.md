Usage in states
============================

Before we start make sure you are familiar with:
- [Installation guide for ui-router](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/1-installation.md) 
- [Managing permissions](https://github.com/Narzerus/angular-permission/blob/development/docs/1-manging-permissions.md)
- [Manging routes](https://github.com/Narzerus/angular-permission/blob/development/docs/2-manging-roles.md)

----------------------------

Now that you are ready to start working with controlling access to the states of your application. In order to restrict any states angular-permission rely on ui-router's `data` property, reserving key `permissions` for routes which requires authorization.

Permissions object accepts following properties:

| Property        | Accepted value                      |
| :-------------- | :---------------------------------- |
| `only`          | `[ String|Array|Function|Promise]`  |
| `except`        | `[ String|Array|Function|Promise]`  |
| `redirectTo`    | `[ String|Function|Object ]`        |

Property only and except
----------------------------

Property `only`:
  - when used as `String` contains single permission or role that are allowed to access the state
  - when used as `Array` contains set of permissions and/or roles that are allowed to access the state
  - when used as `Function` or `Promise` returns single/set of permissions and/or roles that are allowed to access the state

Property `except`: 
  - when used as `String` contains single permission or role that are denied to access the state
  - when used as `Array` contains set of permissions and/or roles that are denied to access the state
  - when used as `Function` or `Promise` returns single or set of permissions and/or roles that are denied to access the state
  
> **:warning: Important! ** If you combine both `only` and `except` properties you have make sure that they are not excluding each other, because denied roles/permissions would not allow access the state for users event if allowed ones would pass them.   

For single permission/role you can simply pass it's name to only/except property:

```javascript
// We define a route via ui-router's $stateProvider
$stateProvider
  .state('adminDashboard', {
    url: '...',
    data: {
      permissions: {
        only: 'isAuthorized'
      }
    }
  });
```

In given case when user is trying to access `adminDashboard` state `StateAuthorization` service is called checking if `isAuthorized` permission is valid looking through PermissionStore and RoleStore for it's definition: 
  - if permission definition is not found it stops transition
  - if permission definition is found but `validationFunction` returns false or rejected promise it stops transition
  - if permission definition is found and `validationFunction` returns true or resolved promise, meaning that user is authorized to access the state transition proceeds to the state

For multiple permissions/roles available you can pass set of names:

```javascript
// We define a route via ui-router's $stateProvider
$stateProvider
  .state('admin', {
    url: '...',
    data: {
      permissions: {
        only: ['isAuthorized','ADMIN']
      }
    }
  });
```

You can either set an `only` or an `except` array.

```javascript
// Let's prevent anonymous users from looking at a dashboard
$stateProvider
  .state('dashboard', {
    url: '...',
    data: {
      permissions: {
        except: ['anonymous']
      }
    }
  });
```

Property redirectTo
----------------------------

redirection configuration when user is not authorized to access the state

You can also set `redirectTo` property that will handle unmatched permission redirection:

```javascript
$stateProvider
  .state('dashboard', {
    url: '...',
    data: {
      permissions: {
        except: ['anonymous'],
        redirectTo: 'login'
      }
    }
  });
```

Property `redirectTo` can also accept function:

```javascript
$stateProvider
  .state('agenda', {
    data: {
      permissions: {
        only: ['manager'],
        redirectTo: function(){
          return 'auth';
        },
        // or alternatively return customizable redirection object
        redirectTo: function(){
          return {
            state: 'dashboard',
            params: {
              // custom redirection parameters
              paramOne: 'one'
              paramTwo: 'two'
            },
            options: {
             // custom ui-router transition params
             location: false
             reload: true
            }
          }
        }
      }
    }
  })
```

**Important!** Remember to always return _route's state name or object_. Otherwise errors will thrown from either Permission or UI-Router library.

or object with map of permissions/roles:

```javascript
$stateProvider
  .state('agenda', {
    data: {
      permissions: {
        only: ['manager'],
        redirectTo: {
          account: 'profile',
          user: function(){
            return 'dashboard';
          },
          admin: {
            state: 'dashboard',
            params: {
              // custom redirection parameters
              paramOne: 'one'
              paramTwo: 'two'
            },
            options: {
              // custom ui-router transition params
              location: false
              reload: true
            }
          },
          default: 'auth'
        }
      }
    }
  })
```

**Important!** Remember define _default_ property that will handle fallback redirect for not defined permissions. Otherwise errors will thrown from either Permission or UI-Router library. 
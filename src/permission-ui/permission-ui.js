'use strict';

/**
 * @namespace permission.ui
 */

/**
 * @param $stateProvider {Object}
 */
function config($stateProvider) {
  'ngInject';

  function $state($delegate) {
    /**
     * Property containing full state object definition
     *
     * This decorator is required to access full state object instead of just it's configuration
     * Can be removed when implemented https://github.com/angular-ui/ui-router/issues/13.
     *
     * @returns {Object}
     */
    $delegate.self.$$permissionState = function() {
      return $delegate;
    };

    return $delegate;
  }

  $stateProvider.decorator('$state', $state);
}

/**
 * @param $transitions {object}
 * @param PermTransitionProperties {permission.PermTransitionProperties}
 * @param PermStateAuthorization {permission.ui.PermStateAuthorization}
 * @param PermStatePermissionMap {permission.ui.PermStatePermissionMap}
 */
function run($transitions, PermTransitionProperties, PermStateAuthorization, PermStatePermissionMap) {
  'ngInject';

  $transitions.onStart({}, function(transition) {
    var _toState = transition.to();
    var _toParams = transition.params('to');
    var _fromState = transition.from();
    var _fromParams = transition.params('from');
    var _options = transition.options();

    setTransitionProperties();

    var statePermissionMap = new PermStatePermissionMap(PermTransitionProperties.toState);

    return PermStateAuthorization
      .authorizeByPermissionMap(statePermissionMap)
      .catch(function(rejectedPermission) {
        console.log('handleUnauthorizedState');
        return handleUnauthorizedState(rejectedPermission, statePermissionMap);
      });

    /**
     * Handles redirection for unauthorized access
     * @method
     * @private
     *
     * @param rejectedPermission {String} Rejected access right
     * @param statePermissionMap {permission.ui.PermPermissionMap} State permission map
     */
    function handleUnauthorizedState(rejectedPermission, statePermissionMap) {
      return statePermissionMap
        .resolveRedirectState(rejectedPermission)
        .then(function(redirect) {
          return transition.router.stateService
            .target(redirect.state, redirect.params, redirect.options);
        });
    }

    /**
     * Updates values of `PermTransitionProperties` holder object
     * @method
     * @private
     */
    function setTransitionProperties() {
      PermTransitionProperties.toState = _toState;
      PermTransitionProperties.toParams = _toParams;
      PermTransitionProperties.fromState = _fromState;
      PermTransitionProperties.fromParams = _fromParams;
      PermTransitionProperties.options = _options;
    }
  });
}

var uiPermission = angular
  .module('permission.ui', ['permission', 'ui.router'])
  .config(config)
  .run(run);

if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = uiPermission.name;
}

import * as _ from 'lodash';
import * as React from 'react';
import { computed } from 'mobx';
import { observer, inject } from 'mobx-react';
import {
    Router,
    RouteComponentProps,
    Redirect,
    LocationProvider
} from '@reach/router';

import { styled } from '../styles';
import { WithInjected } from '../types';
import { appHistory } from '../routing';
import { useHotkeys, Ctrl } from '../util/ui';

import { AccountStore } from '../model/account/account-store';
import { serverVersion, versionSatisfies, MOCK_SERVER_RANGE } from '../services/service-versions';

import { Sidebar, SidebarItem, SIDEBAR_WIDTH } from './sidebar';
import { InterceptPage } from './intercept/intercept-page';
import { ViewPage } from './view/view-page';
import { MockPage } from './mock/mock-page';
import { SettingsPage } from './settings/settings-page';

const AppContainer = styled.div<{ inert?: boolean }>`
    display: flex;
    height: 100%;

    > :not(:first-child) {
        flex: 1 1;
        width: calc(100% - ${SIDEBAR_WIDTH});
    }
`;

interface ExtendProps extends React.PropsWithChildren<any> {
	pageComponent: React.ComponentType<{}>;
}

const Route = ({ children, ...props }: ExtendProps & RouteComponentProps): React.ReactElement => {
	const { pageComponent, ...otherProps } = props;
	return (
		<props.pageComponent {...otherProps}>
			{children}
		</props.pageComponent>
	)
};

const AppKeyboardShortcuts = (props: {
    navigate: (path: string) => void,
}) => {
    useHotkeys('Ctrl+1,Cmd+1', (e) => {
        props.navigate('/intercept');
        e.preventDefault();
    }, [props.navigate]);
    useHotkeys('Ctrl+2,Cmd+2', (e) => {
        props.navigate('/view');
        e.preventDefault();
    }, [props.navigate]);
    useHotkeys('Ctrl+3,Cmd+3', (e) => {
        props.navigate('/mock');
        e.preventDefault();
    }, [props.navigate]);
    useHotkeys('Ctrl+9,Cmd+9', (e) => {
        props.navigate('/settings');
        e.preventDefault();
    }, [props.navigate]);

    return null;
};

@inject('accountStore')
@observer
class App extends React.Component<{ accountStore: AccountStore }> {
    @computed
    get menuItems() {
        return [
            {
                name: 'Intercept',
                title: `Connect clients to HTTP Toolkit (${Ctrl}+1)`,
                icon: ['fas', 'plug'],
                position: 'top',
                type: 'router',
                url: '/intercept'
            },
            {
                name: 'View',
                title: `View intercepted HTTP traffic (${Ctrl}+2)`,
                icon: ['fas', 'search'],
                position: 'top',
                type: 'router',
                url: '/view'
            },

            ...(
                (
                    // Hide Mock option if the server is too old for proper support.
                    // We show by default to avoid flicker in the most common case
                    serverVersion.state !== 'fulfilled' ||
                    versionSatisfies(serverVersion.value as string, MOCK_SERVER_RANGE)
                )
                ? [{
                    name: 'Mock',
                    title: `Add rules to mock & rewrite HTTP traffic (${Ctrl}+3)`,
                    icon: ['fas', 'theater-masks'],
                    position: 'top',
                    type: 'router',
                    url: '/mock'
                }]
                : []
            ),

            {
                name: 'Settings',
                title: `Reconfigure HTTP Toolkit (${Ctrl}+9)`,
                icon: ['fas', 'cog'],
                position: 'bottom',
                type: 'router',
                url: '/settings'
            },

            {
                name: 'Give feedback',
                title: "Suggest features or report issues",
                icon: ['far', 'comment'],
                position: 'bottom',
                highlight: true,
                type: 'web',
                url: 'https://github.com/httptoolkit/httptoolkit/issues/new/choose'
            }
        ] as SidebarItem[];
    }

    render() {
        return <LocationProvider history={appHistory}>
            <AppKeyboardShortcuts
                navigate={appHistory.navigate}
            />
            <AppContainer>
                <Sidebar items={this.menuItems} />

                <Router>
                    <Redirect noThrow from="/" to={'/intercept'} />
                    <Route path={'/intercept'} pageComponent={InterceptPage} />
                    <Route path={'/view'} pageComponent={ViewPage} />
                    <Route path={'/view/:eventId'} pageComponent={ViewPage} />
                    <Route path={'/mock'} pageComponent={MockPage} />
                    <Route path={'/mock/:initialRuleId'} pageComponent={MockPage} />
                    <Route path={'/settings'} pageComponent={SettingsPage} />
                </Router>
            </AppContainer>
        </LocationProvider>;
    }
}

// Annoying cast required to handle the store prop nicely in our types
const AppWithStoreInjected = (
    App as unknown as WithInjected<typeof App, 'accountStore'>
);

export { AppWithStoreInjected as App };
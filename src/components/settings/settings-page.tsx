import * as _ from 'lodash';
import * as React from 'react';
import { observer, inject } from "mobx-react";

import { WithInjected } from '../../types';
import { styled, Theme, ThemeName } from '../../styles';

import { UiStore } from '../../model/ui-store';
import { serverVersion, versionSatisfies, PORT_RANGE_SERVER_RANGE } from '../../services/service-versions';

import { CollapsibleCard, CollapsibleCardHeading } from '../common/card';
import { TabbedOptionsContainer, Tab, TabsContainer } from '../common/tabbed-options';
import { BaseEditor } from '../editor/base-editor';

import * as amIUsingHtml from '../../amiusing.html';

import { ProxySettingsCard } from './proxy-settings-card';
import { ConnectionSettingsCard } from './connection-settings-card';
import { ApiSettingsCard } from './api-settings-card';

interface SettingsPageProps {
    uiStore: UiStore;
}

const SettingsPageScrollContainer = styled.div`
    height: 100%;
    width: 100%;
    overflow-y: auto;
`;

const SettingPageContainer = styled.section`
    margin: 0px auto 20px;
    padding: 40px;
    max-width: 800px;
    position: relative;

    * {
        transition: background-color 0.3s, margin-bottom 0.1s;
    }
`;

const SettingsHeading = styled.h1`
    font-size: ${p => p.theme.loudHeadingSize};
    font-weight: bold;
    margin-bottom: 40px;
`;

const ThemeColors = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: 3px solid #999;
    margin: 0 20px;
`;

const ThemeColorBlock = styled.div<{ themeColor: keyof Theme }>`
    width: 60px;
    height: 60px;
    background-color: ${p => p.theme[p.themeColor]};
`;

const EditorContainer = styled.div`
    border: 3px solid #999;
    height: 300px;
    flex-grow: 1;
`;

@inject('uiStore')
@observer
class SettingsPage extends React.Component<SettingsPageProps> {

    render() {
        const { uiStore } = this.props;
        const cardProps = uiStore.settingsCardProps;
        return <SettingsPageScrollContainer>
            <SettingPageContainer>
                <SettingsHeading>Settings</SettingsHeading>

                <>
                    {
                        _.isString(serverVersion.value) &&
                        versionSatisfies(serverVersion.value, PORT_RANGE_SERVER_RANGE) && <>
                            <ProxySettingsCard {...cardProps.proxy} />
                            <ConnectionSettingsCard {...cardProps.connection} />
                        </>
                    }

                    <ApiSettingsCard {...cardProps.api} />

                    <CollapsibleCard {...cardProps.themes}>
                        <header>
                            <CollapsibleCardHeading onCollapseToggled={
                                cardProps.themes.onCollapseToggled
                            }>
                                Themes
                            </CollapsibleCardHeading>
                        </header>
                        <TabbedOptionsContainer>
                            <TabsContainer
                                onClick={(value: ThemeName | Theme) => uiStore.setTheme(value)}
                                isSelected={(value: ThemeName | Theme) => {
                                    if (typeof value === 'string') {
                                        return uiStore.themeName === value
                                    } else {
                                        return _.isEqual(value, uiStore.theme);
                                    }
                                }}
                            >
                                <Tab
                                    icon={['fas', 'sun']}
                                    value='light'
                                >
                                    Light
                                </Tab>
                                <Tab
                                    icon={['fas', 'moon']}
                                    value='dark'
                                >
                                    Dark
                                </Tab>
                                <Tab
                                    icon={['fas', 'adjust']}
                                    value={'high-contrast'}
                                >
                                    High Contrast
                                </Tab>
                            </TabsContainer>
                            <ThemeColors>
                                <ThemeColorBlock themeColor='mainColor' />
                                <ThemeColorBlock themeColor='mainBackground' />
                                <ThemeColorBlock themeColor='highlightColor' />
                                <ThemeColorBlock themeColor='highlightBackground' />
                                <ThemeColorBlock themeColor='primaryInputColor' />
                                <ThemeColorBlock themeColor='primaryInputBackground' />
                                <ThemeColorBlock themeColor='containerWatermark' />
                                <ThemeColorBlock themeColor='containerBorder' />
                                <ThemeColorBlock themeColor='mainLowlightBackground' />
                                <ThemeColorBlock themeColor='containerBackground' />
                            </ThemeColors>

                            <EditorContainer>
                                <BaseEditor
                                    contentId={null}
                                    language='html'
                                    theme={uiStore.theme.monacoTheme}
                                    defaultValue={amIUsingHtml}
                                />
                            </EditorContainer>
                        </TabbedOptionsContainer>
                    </CollapsibleCard>
                </>
            </SettingPageContainer>
        </SettingsPageScrollContainer>;
    }
}

// Annoying cast required to handle the store prop nicely in our types
const InjectedSettingsPage = SettingsPage as unknown as WithInjected<
    typeof SettingsPage,
    'uiStore'
>;
export { InjectedSettingsPage as SettingsPage };
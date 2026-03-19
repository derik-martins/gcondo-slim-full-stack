import { Menu as AntdMenu, type MenuProps } from 'antd';
import AntdSider from 'antd/es/layout/Sider';

import type { RenderSiderProps } from './Root';

type SiderProps = RenderSiderProps & Pick<MenuProps, 'items' | 'defaultSelectedKeys'>;

export function Sider({ collapsed, onCollapse, items, defaultSelectedKeys }: SiderProps) {
    const sidebarBg = '#001529';

    return (
        <AntdSider
            width={200}
            collapsible
            collapsed={collapsed}
            onCollapse={onCollapse}
            style={{ background: sidebarBg }}
        >
            <div
                style={{
                    height: 72,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingInline: 0,
                    background: sidebarBg
                }}
            >
                <img src="/logo-gcondo.png" alt="Gcondo" style={{ width: 34, height: 34 }} />
            </div>

            <AntdMenu
                mode="inline"
                theme="dark"
                items={items}
                defaultSelectedKeys={defaultSelectedKeys}
                style={{ height: 'calc(100% - 72px)', borderRight: 0 }}
            />
        </AntdSider>
    );
}

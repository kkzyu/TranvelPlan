import { Header } from 'antd/es/layout/layout';
import styles from './index.less'
import { Button, Menu, MenuProps } from "antd";
import { DeleteOutlined } from '@ant-design/icons';
import { PlanItem } from '@/pages';

interface HeaderBarProps {
    selectedKey: string;
    planItems: PlanItem[];
    onMenuSelect: (key: string) => void;
    onClearAll: () => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
    selectedKey,
    planItems,
    onMenuSelect,
    onClearAll,
}) => {
    const handleMenuClick: MenuProps['onClick'] = ({key}) => {
        onMenuSelect(key);
    };

    return (
        <Header className={styles.header} >
            <div className={styles.logo}>自定义旅行计划</div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={[
            { key: '1', label: '愿望景点单' },
            { key: '2', label: '在线记事本' },
          ]}
          className={styles.menu}
        />

        {planItems.length > 0 && (
          <div className={styles.planInfo}>
            <span className={styles.planCount}>已保存 {planItems.length} 个景点</span>
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={onClearAll}
              className={styles.clearButton}
              title="清除所有数据"
            >
              清除
            </Button>
          </div>
        )}
      </Header>
    )
}
export default HeaderBar;
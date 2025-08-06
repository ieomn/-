import { useParams, NavLink } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const categoryData = {
  lathe: {
    name: "车床",
    description: "车床是一种主要用于加工回转体零件的机床，通过工件的旋转运动和刀具的直线或曲线运动来实现对工件的切削加工。车床加工精度高，适用范围广，是机械制造中最重要的机床之一。",
    models: [
      {
        id: "ck6140-v2",
        name: "CK6140-V2型数控车床",
        image: "🏭",
        specs: "最大回转直径: φ400mm, 最大加工长度: 750mm"
      },
      {
        id: "ck6150",
        name: "CK6150型数控车床", 
        image: "🏭",
        specs: "最大回转直径: φ500mm, 最大加工长度: 1000mm"
      }
    ]
  },
  mill: {
    name: "铣床",
    description: "铣床是用铣刀对工件进行铣削加工的机床。铣床除能铣削平面、沟槽、轮齿、螺纹和花键轴外，还能加工比较复杂的型面，效率较刨床高，在机械制造和修理部门得到广泛应用。",
    models: [
      {
        id: "xk714",
        name: "XK714型数控铣床",
        image: "🏭",
        specs: "工作台面积: 1400×400mm, 主轴转速: 6000rpm"
      }
    ]
  }
};

export const CategoryOverview = () => {
  const { category } = useParams();
  const data = categoryData[category as keyof typeof categoryData];

  if (!data) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-foreground">未找到类别</h1>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">{data.name}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl">
          {data.description}
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">可用型号</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.models.map((model) => (
            <Card key={model.id} className="hover:shadow-lg transition-shadow cursor-pointer hover-scale">
              <CardHeader className="text-center">
                <div className="text-6xl mb-4">{model.image}</div>
                <CardTitle className="text-lg">{model.name}</CardTitle>
                <CardDescription className="text-sm">
                  {model.specs}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <NavLink to={`/category/${category}/${model.id}`} className="text-primary hover:text-primary/80 font-medium text-sm">
                    查看详情 →
                  </NavLink>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">技术特点</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">高精度加工</h4>
            <p className="text-muted-foreground">采用先进的数控系统，确保加工精度和重复精度</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">智能化控制</h4>
            <p className="text-muted-foreground">集成多种智能控制功能，提高生产效率</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">模块化设计</h4>
            <p className="text-muted-foreground">标准化模块设计，便于维护和升级</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">环保节能</h4>
            <p className="text-muted-foreground">采用节能设计，降低能耗和环境影响</p>
          </div>
        </div>
      </div>
    </div>
  );
};
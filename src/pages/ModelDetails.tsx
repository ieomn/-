import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const modelData = {
  "ck6140-v2": {
    name: "CK6140-V2型数控车床",
    category: "车床",
    introduction: {
      overview: "CK6140-V2型数控车床是我公司最新研发的高精度数控车床，采用先进的数控系统和精密的机械结构，适用于各种回转体零件的精密加工。",
      features: [
        "高刚性铸铁床身，确保加工稳定性",
        "精密滚珠丝杠，提高传动精度",
        "高速主轴，适用于多种材料加工",
        "全封闭防护设计，安全环保"
      ],
      applications: "广泛应用于汽车、航空、机械制造等领域的精密零件加工"
    },
    specifications: [
      { parameter: "最大回转直径", value: "φ400mm", unit: "" },
      { parameter: "最大加工直径", value: "φ200mm", unit: "" },
      { parameter: "最大加工长度", value: "750mm", unit: "" },
      { parameter: "主轴转速范围", value: "50-4000", unit: "rpm" },
      { parameter: "主轴功率", value: "7.5", unit: "kW" },
      { parameter: "X轴行程", value: "200", unit: "mm" },
      { parameter: "Z轴行程", value: "750", unit: "mm" },
      { parameter: "快移速度", value: "24", unit: "m/min" },
      { parameter: "定位精度", value: "±0.005", unit: "mm" },
      { parameter: "重复定位精度", value: "±0.003", unit: "mm" },
      { parameter: "整机重量", value: "3500", unit: "kg" }
    ],
    configuration: {
      "数控系统": "FANUC 0i-TF",
      "主轴电机": "7.5kW伺服电机",
      "进给电机": "X/Z轴各配1kW伺服电机",
      "刀塔": "12工位液压刀塔",
      "卡盘": "液压三爪卡盘φ200mm",
      "冷却系统": "内外冷却循环系统",
      "排屑器": "链板式排屑器",
      "防护": "全封闭钣金防护"
    },
    media: [
      { type: "image", title: "整机外观", url: "🏭" },
      { type: "image", title: "加工区域", url: "⚙️" },
      { type: "image", title: "控制面板", url: "🖥️" },
      { type: "video", title: "加工演示", url: "🎥" }
    ]
  },
  "ck6150": {
    name: "CK6150型数控车床",
    category: "车床",
    introduction: {
      overview: "CK6150型数控车床是专为中等直径工件设计的高精度数控车床，具有优异的加工精度和稳定性，是中型零件加工的理想选择。",
      features: [
        "加强型床身设计，提升整机刚性",
        "高精度主轴系统，保证加工质量",
        "智能冷却系统，延长刀具寿命",
        "人机工程学设计，操作便捷"
      ],
      applications: "适用于机械、电子、仪表等行业的中小型精密零件加工"
    },
    specifications: [
      { parameter: "最大回转直径", value: "φ500mm", unit: "" },
      { parameter: "最大加工直径", value: "φ320mm", unit: "" },
      { parameter: "最大加工长度", value: "1000mm", unit: "" },
      { parameter: "主轴转速范围", value: "30-3000", unit: "rpm" },
      { parameter: "主轴功率", value: "11", unit: "kW" },
      { parameter: "X轴行程", value: "320", unit: "mm" },
      { parameter: "Z轴行程", value: "1000", unit: "mm" },
      { parameter: "快移速度", value: "20", unit: "m/min" },
      { parameter: "定位精度", value: "±0.008", unit: "mm" },
      { parameter: "重复定位精度", value: "±0.005", unit: "mm" },
      { parameter: "整机重量", value: "4800", unit: "kg" }
    ],
    configuration: {
      "数控系统": "FANUC 0i-TD",
      "主轴电机": "11kW交流伺服电机",
      "进给电机": "X/Z轴各配1.5kW伺服电机",
      "刀塔": "8工位电动刀塔",
      "卡盘": "液压三爪卡盘φ320mm",
      "冷却系统": "大流量冷却循环系统",
      "排屑器": "螺旋式排屑器",
      "防护": "全封闭安全防护"
    },
    media: [
      { type: "image", title: "整机外观", url: "🏭" },
      { type: "image", title: "主轴箱", url: "⚙️" },
      { type: "image", title: "刀塔系统", url: "🔧" },
      { type: "video", title: "操作演示", url: "🎥" }
    ]
  },
  "ck6132": {
    name: "CK6132型数控车床",
    category: "车床",
    introduction: {
      overview: "CK6132型数控车床是经济型数控车床的代表产品，结构简洁、操作简便，适合批量生产和教学培训使用。",
      features: [
        "经济实用的设计方案",
        "简化的操作界面，易学易用",
        "稳定可靠的机械结构",
        "维护成本低，性价比高"
      ],
      applications: "适用于教学培训、小批量生产和简单零件加工"
    },
    specifications: [
      { parameter: "最大回转直径", value: "φ320mm", unit: "" },
      { parameter: "最大加工直径", value: "φ200mm", unit: "" },
      { parameter: "最大加工长度", value: "750mm", unit: "" },
      { parameter: "主轴转速范围", value: "100-2500", unit: "rpm" },
      { parameter: "主轴功率", value: "5.5", unit: "kW" },
      { parameter: "X轴行程", value: "200", unit: "mm" },
      { parameter: "Z轴行程", value: "750", unit: "mm" },
      { parameter: "快移速度", value: "15", unit: "m/min" },
      { parameter: "定位精度", value: "±0.01", unit: "mm" },
      { parameter: "重复定位精度", value: "±0.008", unit: "mm" },
      { parameter: "整机重量", value: "2800", unit: "kg" }
    ],
    configuration: {
      "数控系统": "GSK 980TDb",
      "主轴电机": "5.5kW交流电机",
      "进给电机": "X/Z轴各配0.75kW步进电机",
      "刀塔": "4工位手动刀塔",
      "卡盘": "手动三爪卡盘φ200mm",
      "冷却系统": "标准冷却循环系统",
      "排屑器": "简易排屑盘",
      "防护": "透明防护门"
    },
    media: [
      { type: "image", title: "整机外观", url: "🏭" },
      { type: "image", title: "操作面板", url: "🖥️" },
      { type: "image", title: "加工演示", url: "⚙️" },
      { type: "video", title: "培训视频", url: "🎥" }
    ]
  },
  "xk714": {
    name: "XK714型数控铣床",
    category: "铣床",
    introduction: {
      overview: "XK714型数控铣床是一款高精度立式加工中心，具有优秀的加工精度和表面质量，适用于各种复杂零件的精密加工。",
      features: [
        "高速高精度主轴系统",
        "三轴联动加工能力",
        "自动换刀系统",
        "高刚性机床结构"
      ],
      applications: "广泛应用于模具、汽车、航空等领域的精密零件加工"
    },
    specifications: [
      { parameter: "工作台尺寸", value: "800×400", unit: "mm" },
      { parameter: "X轴行程", value: "700", unit: "mm" },
      { parameter: "Y轴行程", value: "400", unit: "mm" },
      { parameter: "Z轴行程", value: "450", unit: "mm" },
      { parameter: "主轴转速", value: "100-8000", unit: "rpm" },
      { parameter: "主轴功率", value: "7.5", unit: "kW" },
      { parameter: "快移速度", value: "24", unit: "m/min" },
      { parameter: "定位精度", value: "±0.005", unit: "mm" },
      { parameter: "重复定位精度", value: "±0.003", unit: "mm" },
      { parameter: "最大负载", value: "300", unit: "kg" },
      { parameter: "整机重量", value: "3200", unit: "kg" }
    ],
    configuration: {
      "数控系统": "FANUC 0i-MF",
      "主轴电机": "7.5kW伺服电机",
      "进给电机": "三轴各配1kW伺服电机",
      "刀库": "20刀位刀库",
      "换刀时间": "8秒",
      "冷却系统": "内冷外冷循环系统",
      "排屑器": "链板式排屑器",
      "防护": "全封闭防护罩"
    },
    media: [
      { type: "image", title: "整机外观", url: "🏭" },
      { type: "image", title: "主轴头", url: "⚙️" },
      { type: "image", title: "刀库系统", url: "🔧" },
      { type: "video", title: "加工演示", url: "🎥" }
    ]
  },
  "xk7136": {
    name: "XK7136型数控铣床",
    category: "铣床",
    introduction: {
      overview: "XK7136型数控铣床是大型立式加工中心，具有强大的加工能力和卓越的稳定性，专为大型零件加工而设计。",
      features: [
        "大型工作台，承载能力强",
        "重型床身设计",
        "高功率主轴系统",
        "先进的热补偿技术"
      ],
      applications: "适用于大型模具、机械部件和重型零件的加工"
    },
    specifications: [
      { parameter: "工作台尺寸", value: "1400×600", unit: "mm" },
      { parameter: "X轴行程", value: "1300", unit: "mm" },
      { parameter: "Y轴行程", value: "600", unit: "mm" },
      { parameter: "Z轴行程", value: "650", unit: "mm" },
      { parameter: "主轴转速", value: "50-6000", unit: "rpm" },
      { parameter: "主轴功率", value: "15", unit: "kW" },
      { parameter: "快移速度", value: "20", unit: "m/min" },
      { parameter: "定位精度", value: "±0.008", unit: "mm" },
      { parameter: "重复定位精度", value: "±0.005", unit: "mm" },
      { parameter: "最大负载", value: "800", unit: "kg" },
      { parameter: "整机重量", value: "8500", unit: "kg" }
    ],
    configuration: {
      "数控系统": "SIEMENS 828D",
      "主轴电机": "15kW伺服电机",
      "进给电机": "三轴各配2kW伺服电机",
      "刀库": "30刀位刀库",
      "换刀时间": "12秒",
      "冷却系统": "大流量冷却系统",
      "排屑器": "重型链板排屑器",
      "防护": "重型安全防护"
    },
    media: [
      { type: "image", title: "整机外观", url: "🏭" },
      { type: "image", title: "大型工作台", url: "📐" },
      { type: "image", title: "重型主轴", url: "⚙️" },
      { type: "video", title: "重型加工", url: "🎥" }
    ]
  },
  "xk7125": {
    name: "XK7125型数控铣床",
    category: "铣床",
    introduction: {
      overview: "XK7125型数控铣床是紧凑型立式加工中心，结构紧凑、功能齐全，适合中小型企业和教学机构使用。",
      features: [
        "紧凑的机床结构",
        "经济实用的配置",
        "操作简便，维护方便",
        "高性价比解决方案"
      ],
      applications: "适用于中小型零件加工、样品制作和教学培训"
    },
    specifications: [
      { parameter: "工作台尺寸", value: "600×300", unit: "mm" },
      { parameter: "X轴行程", value: "500", unit: "mm" },
      { parameter: "Y轴行程", value: "300", unit: "mm" },
      { parameter: "Z轴行程", value: "350", unit: "mm" },
      { parameter: "主轴转速", value: "200-6000", unit: "rpm" },
      { parameter: "主轴功率", value: "5.5", unit: "kW" },
      { parameter: "快移速度", value: "18", unit: "m/min" },
      { parameter: "定位精度", value: "±0.01", unit: "mm" },
      { parameter: "重复定位精度", value: "±0.008", unit: "mm" },
      { parameter: "最大负载", value: "150", unit: "kg" },
      { parameter: "整机重量", value: "2200", unit: "kg" }
    ],
    configuration: {
      "数控系统": "GSK 25i-MB",
      "主轴电机": "5.5kW伺服电机",
      "进给电机": "三轴各配0.85kW伺服电机",
      "刀库": "12刀位刀库",
      "换刀时间": "10秒",
      "冷却系统": "标准冷却系统",
      "排屑器": "螺旋排屑器",
      "防护": "标准防护门"
    },
    media: [
      { type: "image", title: "整机外观", url: "🏭" },
      { type: "image", title: "紧凑设计", url: "📏" },
      { type: "image", title: "操作界面", url: "🖥️" },
      { type: "video", title: "操作演示", url: "🎥" }
    ]
  }
};

export const ModelDetails = () => {
  const { category, model } = useParams();
  const data = modelData[model as keyof typeof modelData];

  if (!data) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-foreground">未找到型号信息</h1>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary">{data.category}</Badge>
          <span className="text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">型号详情</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">{data.name}</h1>
      </div>

      <Tabs defaultValue="introduction" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="introduction">机床介绍</TabsTrigger>
          <TabsTrigger value="specifications">技术参数</TabsTrigger>
          <TabsTrigger value="configuration">配置信息</TabsTrigger>
          <TabsTrigger value="media">图片/视频</TabsTrigger>
        </TabsList>

        <TabsContent value="introduction" className="mt-6 animate-fade-in">
          <div className="space-y-6">
            <Card className="hover-scale">
              <CardHeader>
                <CardTitle>产品概述</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {data.introduction.overview}
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardHeader>
                <CardTitle>主要特点</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.introduction.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardHeader>
                <CardTitle>应用领域</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{data.introduction.applications}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="specifications" className="mt-6 animate-fade-in">
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle>技术参数表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 bg-data-header font-medium">参数名称</th>
                      <th className="text-left py-3 px-4 bg-data-header font-medium">数值</th>
                      <th className="text-left py-3 px-4 bg-data-header font-medium">单位</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.specifications.map((spec, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/30">
                        <td className="py-3 px-4 font-medium">{spec.parameter}</td>
                        <td className="py-3 px-4 text-muted-foreground">{spec.value}</td>
                        <td className="py-3 px-4 text-muted-foreground">{spec.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="mt-6 animate-fade-in">
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle>配置信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(data.configuration).map(([key, value]) => (
                  <div key={key} className="border border-border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{key}</h4>
                    <p className="text-muted-foreground text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="mt-6 animate-fade-in">
          <Card className="hover-scale">
            <CardHeader>
              <CardTitle>图片/视频资料</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.media.map((item, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 text-center hover:bg-muted/30 cursor-pointer">
                    <div className="text-4xl mb-3">{item.url}</div>
                    <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {item.type === "image" ? "图片" : "视频"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
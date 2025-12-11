import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, User, Briefcase, MapPin, DollarSign, 
  Award, BookOpen, GraduationCap, Building2, Plus, X 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Default mock data matching the expert structure
const defaultExpertData = {
  name: "Người dùng Locaith",
  role: "Chuyên gia AI",
  company: "Locaith AI Studio",
  location: "Hà Nội, Việt Nam",
  price: "1.000.000 VNĐ/giờ",
  deposit: "500.000 VNĐ",
  bio: "Chuyên gia tư vấn và phát triển giải pháp AI với kinh nghiệm thực chiến đa dạng. Cam kết chất lượng và hiệu quả cho từng dự án.",
  requirements: "Trao đổi chi tiết yêu cầu trước khi bắt đầu dự án. Ưu tiên các dự án dài hạn.",
  skills: ["AI Consulting", "Machine Learning", "Python", "Data Analysis"],
  education: [
    { degree: "Thạc sĩ Khoa học Máy tính", school: "Đại học Bách Khoa", year: "2020" }
  ],
  experience: [
    { role: "Senior AI Engineer", company: "Tech Corp", period: "2020-Nay", description: "Phát triển các giải pháp AI cho khách hàng doanh nghiệp." }
  ]
};

export const ExpertUpdateFeature = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(defaultExpertData);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    // Load data from localStorage if available
    const savedData = localStorage.getItem('expertProfileData');
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        console.error("Error parsing saved expert data", e);
      }
    }
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    const newEdu = [...formData.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setFormData(prev => ({ ...prev, education: newEdu }));
  };

  const handleExperienceChange = (index: number, field: string, value: string) => {
    const newExp = [...formData.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    setFormData(prev => ({ ...prev, experience: newExp }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('expertProfileData', JSON.stringify(formData));
      toast.success("Đã cập nhật hồ sơ chuyên gia thành công!");
      setLoading(false);
      navigate('/profile');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Cập nhật thông tin chuyên gia</h1>
        </div>
        <Button onClick={handleSave} disabled={loading} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4" />
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Họ và tên hiển thị</Label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      className="pl-9" 
                      value={formData.name} 
                      onChange={(e) => handleChange('name', e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Chức danh / Vai trò</Label>
                  <div className="relative">
                    <Award className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      className="pl-9" 
                      value={formData.role} 
                      onChange={(e) => handleChange('role', e.target.value)} 
                      placeholder="VD: Senior AI Engineer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Công ty / Tổ chức</Label>
                  <div className="relative">
                    <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      className="pl-9" 
                      value={formData.company} 
                      onChange={(e) => handleChange('company', e.target.value)} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Khu vực</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      className="pl-9" 
                      value={formData.location} 
                      onChange={(e) => handleChange('location', e.target.value)} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Chi phí & Dịch vụ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Mức giá (theo giờ)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      className="pl-9" 
                      value={formData.price} 
                      onChange={(e) => handleChange('price', e.target.value)} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Đặt cọc tối thiểu</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      className="pl-9" 
                      value={formData.deposit} 
                      onChange={(e) => handleChange('deposit', e.target.value)} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Giới thiệu & Kỹ năng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Giới thiệu bản thân (Bio)</Label>
                  <Textarea 
                    className="min-h-[100px]" 
                    value={formData.bio} 
                    onChange={(e) => handleChange('bio', e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Yêu cầu công việc</Label>
                  <Textarea 
                    className="min-h-[80px]" 
                    value={formData.requirements} 
                    onChange={(e) => handleChange('requirements', e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Kỹ năng chuyên môn</Label>
                  <div className="flex gap-2 mb-2">
                    <Input 
                      value={newSkill} 
                      onChange={(e) => setNewSkill(e.target.value)} 
                      placeholder="Thêm kỹ năng..."
                      onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button type="button" onClick={addSkill} variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="px-2 py-1 gap-1">
                        {skill}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={() => removeSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Học vấn & Kinh nghiệm</CardTitle>
                <CardDescription>Cập nhật thông tin mới nhất của bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 font-medium text-sm text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    <span>Học vấn</span>
                  </div>
                  {formData.education.map((edu, idx) => (
                    <div key={idx} className="grid gap-3 p-3 border rounded-lg bg-secondary/20">
                      <Input 
                        placeholder="Bằng cấp" 
                        value={edu.degree} 
                        onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                        className="h-8 text-sm font-medium"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input 
                          placeholder="Trường" 
                          value={edu.school} 
                          onChange={(e) => handleEducationChange(idx, 'school', e.target.value)}
                          className="h-8 text-xs"
                        />
                        <Input 
                          placeholder="Năm" 
                          value={edu.year} 
                          onChange={(e) => handleEducationChange(idx, 'year', e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-2 font-medium text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>Kinh nghiệm làm việc</span>
                  </div>
                  {formData.experience.map((exp, idx) => (
                    <div key={idx} className="grid gap-3 p-3 border rounded-lg bg-secondary/20">
                      <div className="grid grid-cols-2 gap-3">
                        <Input 
                          placeholder="Vị trí" 
                          value={exp.role} 
                          onChange={(e) => handleExperienceChange(idx, 'role', e.target.value)}
                          className="h-8 text-sm font-medium"
                        />
                        <Input 
                          placeholder="Công ty" 
                          value={exp.company} 
                          onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <Input 
                        placeholder="Thời gian" 
                        value={exp.period} 
                        onChange={(e) => handleExperienceChange(idx, 'period', e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Textarea 
                        placeholder="Mô tả công việc" 
                        value={exp.description} 
                        onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                        className="text-xs min-h-[60px]"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

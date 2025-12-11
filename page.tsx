'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { questions, type FormData } from '@/lib/questions';
import { useRouter } from 'next/navigation';

export default function QuestionnairePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter visible questions based on conditional logic
  const visibleQuestions = questions.filter(q => {
    if (!q.conditional) return true;
    const dependencyValue = formData[q.conditional.dependsOn];
    return q.conditional.condition(dependencyValue);
  });

  // Group questions by section
  const sections = Array.from(new Set(visibleQuestions.map(q => q.section)));
  const questionsInCurrentSection = visibleQuestions.filter(
    q => q.section === sections[currentSection]
  );

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('noa-questionnaire-progress');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved progress:', e);
      }
    }
  }, []);

  // Auto-save progress
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      localStorage.setItem('noa-questionnaire-progress', JSON.stringify(formData));
    }
  }, [formData]);

  // Calculate BMI when height and weight change
  useEffect(() => {
    if (formData.height && formData.weight) {
      const heightInMeters = Number(formData.height) / 100;
      const bmi = Number(formData.weight) / (heightInMeters * heightInMeters);
      setFormData(prev => ({ ...prev, bmi: bmi.toFixed(1) }));
    }
  }, [formData.height, formData.weight]);

  const handleInputChange = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleFileChange = (id: string, file: File | null) => {
    if (file) {
      // In a real app, upload to storage here
      setFormData(prev => ({ ...prev, [id]: file.name }));
    }
  };

  const validateSection = () => {
    const newErrors: Record<string, string> = {};
    
    questionsInCurrentSection.forEach(q => {
      if (q.required && !formData[q.id]) {
        newErrors[q.id] = 'שדה חובה';
        return;
      }

      if (formData[q.id] && q.validation) {
        const result = q.validation.safeParse(formData[q.id]);
        if (!result.success) {
          newErrors[q.id] = result.error.errors[0]?.message || 'ערך לא תקין';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateSection()) {
      if (currentSection < sections.length - 1) {
        setCurrentSection(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validateSection()) return;

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      
      const { error } = await supabase.from('clients').insert([{
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        birth_date: formData.birth_date,
        email: formData.email,
        id_number: formData.id_number,
        id_issue_date: formData.id_issue_date,
        digital_signature: formData.digital_signature,
        id_photo_front: formData.id_photo_front,
        id_photo_back: formData.id_photo_back,
        city: formData.city,
        street: formData.street,
        house_number: formData.house_number,
        postal_code: formData.postal_code,
        gender: formData.gender,
        marital_status: formData.marital_status,
        children_count: formData.children_count ? Number(formData.children_count) : null,
        employment_status: formData.employment_status,
        profession: formData.profession,
        workplace_name: formData.workplace_name,
        workplace_seniority: formData.workplace_seniority ? Number(formData.workplace_seniority) : null,
        monthly_income: formData.monthly_income ? Number(formData.monthly_income) : null,
        smoking_status: formData.smoking_status,
        smoking_quantity: formData.smoking_quantity ? Number(formData.smoking_quantity) : null,
        health_fund: formData.health_fund,
        supplementary_insurance: formData.supplementary_insurance,
        height: formData.height ? Number(formData.height) : null,
        weight: formData.weight ? Number(formData.weight) : null,
        bmi: formData.bmi ? Number(formData.bmi) : null,
        alternative_phone: formData.alternative_phone,
        preferred_contact_method: formData.preferred_contact_method,
        children_ages: formData.children_ages,
        birth_country: formData.birth_country,
        immigration_year: formData.immigration_year ? Number(formData.immigration_year) : null,
        citizenship: formData.citizenship,
        has_spouse: formData.has_spouse === 'yes',
        spouse_first_name: formData.spouse_first_name,
        spouse_last_name: formData.spouse_last_name,
        spouse_id_number: formData.spouse_id_number,
        spouse_birth_date: formData.spouse_birth_date,
        spouse_phone: formData.spouse_phone,
        spouse_email: formData.spouse_email,
        contact_reason: formData.contact_reason,
        focus_areas: formData.focus_areas ? JSON.parse(`[${formData.focus_areas}]`) : null,
        insurance_priority: formData.insurance_priority,
        monthly_budget: formData.monthly_budget ? Number(formData.monthly_budget) : null,
        consent_data_processing: formData.consent_data_processing === true,
        consent_insurance_reports: formData.consent_insurance_reports === true,
        consent_summary_delivery: formData.consent_summary_delivery === true,
        bank_name: formData.bank_name,
        bank_branch: formData.bank_branch ? Number(formData.bank_branch) : null,
        bank_account_number: formData.bank_account_number,
        bank_account_type: formData.bank_account_type,
        bank_account_ownership: formData.bank_account_ownership,
        bank_joint_owner_name: formData.bank_joint_owner_name,
        bank_joint_owner_id: formData.bank_joint_owner_id,
      }]);

      if (error) throw error;

      // Clear saved progress
      localStorage.removeItem('noa-questionnaire-progress');
      
      // Redirect to success page
      router.push('/success');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('אירעה שגיאה בשליחת הטופס. אנא נסה שנית.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentSection + 1) / sections.length) * 100;

  const renderField = (question: typeof questions[0]) => {
    const value = formData[question.id] || '';
    const error = errors[question.id];

    const baseClasses = `w-full px-4 py-3 border-2 rounded-lg transition-colors
      ${error ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}
      focus:outline-none focus:ring-2 focus:ring-blue-200`;

    switch (question.type) {
      case 'text':
      case 'email':
        return (
          <input
            type={question.type}
            value={value}
            onChange={e => handleInputChange(question.id, e.target.value)}
            className={baseClasses}
            placeholder={question.placeholder}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={e => handleInputChange(question.id, e.target.value)}
            className={baseClasses}
            placeholder={question.placeholder}
            min={question.min}
            max={question.max}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={e => handleInputChange(question.id, e.target.value)}
            className={baseClasses}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={e => handleInputChange(question.id, e.target.value)}
            className={baseClasses}
          >
            <option value="">בחר...</option>
            {question.options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map(opt => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={e => handleInputChange(question.id, e.target.value)}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="text-lg">{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value === true}
              onChange={e => handleInputChange(question.id, e.target.checked)}
              className="w-5 h-5 mt-1 text-blue-600 rounded"
            />
            <span className="text-lg leading-relaxed">{question.label}</span>
          </label>
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={e => handleInputChange(question.id, e.target.value)}
            className={`${baseClasses} min-h-[100px] resize-y`}
            placeholder={question.placeholder}
          />
        );

      case 'file':
        return (
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={e => handleFileChange(question.id, e.target.files?.[0] || null)}
              className="w-full text-lg"
            />
            {value && (
              <p className="text-sm text-green-600">✓ קובץ הועלה: {value}</p>
            )}
          </div>
        );

      case 'signature':
        return (
          <div className="space-y-3">
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 h-40 flex items-center justify-center">
              <p className="text-gray-500">אזור חתימה דיגיטלית</p>
            </div>
            <input
              type="text"
              value={value}
              onChange={e => handleInputChange(question.id, e.target.value)}
              placeholder="הקלד את שמך המלא"
              className={baseClasses}
            />
          </div>
        );

      case 'calculated':
        return (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-3">
            <p className="text-2xl font-bold text-blue-600">
              {value || 'ממתין לחישוב...'}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            NOA - טופס קליטת לקוח חדש
          </h1>
          <p className="text-gray-600">
            שלב {currentSection + 1} מתוך {sections.length}: {sections[currentSection]}
          </p>
          
          {/* Progress bar */}
          <div className="mt-4 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white shadow-lg p-8 space-y-6">
          {questionsInCurrentSection.map(question => (
            <div key={question.id} className="space-y-2">
              <label className="block text-lg font-semibold text-gray-800">
                {question.label}
                {question.required && <span className="text-red-500 mr-1">*</span>}
              </label>
              
              {question.description && (
                <p className="text-sm text-gray-600">{question.description}</p>
              )}
              
              {renderField(question)}
              
              {errors[question.id] && (
                <p className="text-red-500 text-sm">{errors[question.id]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-b-2xl shadow-lg p-6 flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentSection === 0}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold
              hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors"
          >
            ← חזור
          </button>

          {currentSection < sections.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600
                text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700
                transition-all shadow-md hover:shadow-lg"
            >
              המשך →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600
                text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700
                transition-all shadow-md hover:shadow-lg disabled:opacity-50
                disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'שולח...' : 'שלח טופס ✓'}
            </button>
          )}
        </div>

        {/* Save progress note */}
        <div className="text-center mt-4 text-sm text-gray-600">
          💾 ההתקדמות שלך נשמרת אוטומטית
        </div>
      </div>
    </div>
  );
}

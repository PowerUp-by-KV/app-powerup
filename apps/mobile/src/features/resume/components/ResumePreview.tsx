/**
 * ResumePreview Component - Formatted resume display
 * Shows professional resume layout
 */

import { ScrollView, View } from "react-native";
import { Text } from "@/components/Themed";
import type { ResumeParsedData } from "@app-powerup/shared";

interface ResumePreviewProps {
  data: ResumeParsedData;
}

export function ResumePreview({ data }: ResumePreviewProps) {
  return (
    <ScrollView className="bg-white p-6">
      {/* Header - Contact Info */}
      <View className="border-b border-gray-300 pb-4">
        <Text className="mb-1 text-2xl font-bold text-gray-900">{data.contact.fullName}</Text>

        {/* Contact Details */}
        <View className="mt-2 space-y-1">
          {data.contact.email && (
            <Text className="text-sm text-gray-700">{data.contact.email}</Text>
          )}
          {data.contact.phone && (
            <Text className="text-sm text-gray-700">{data.contact.phone}</Text>
          )}
          {data.contact.location && (
            <Text className="text-sm text-gray-700">{data.contact.location}</Text>
          )}
          {data.contact.linkedin && (
            <Text className="text-sm text-blue-600">{data.contact.linkedin}</Text>
          )}
        </View>
      </View>

      {/* Summary */}
      {data.summary.text && (
        <View className="mt-6">
          <Text className="mb-2 text-lg font-bold text-gray-900">PROFESSIONAL SUMMARY</Text>
          <Text className="text-sm leading-6 text-gray-700">{data.summary.text}</Text>
        </View>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <View className="mt-6">
          <Text className="mb-4 text-lg font-bold text-gray-900">EXPERIENCE</Text>
          {data.experience.map((exp) => (
            <View key={exp.id} className="mb-4">
              <View className="flex-row items-center justify-between">
                <Text className="font-bold text-gray-900">{exp.position}</Text>
                <Text className="text-xs text-gray-600">
                  {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : "- Present"}
                </Text>
              </View>
              <Text className="text-sm text-gray-600">{exp.company}</Text>
              <Text className="mt-1 leading-5 text-sm text-gray-700">{exp.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <View className="mt-6">
          <Text className="mb-4 text-lg font-bold text-gray-900">EDUCATION</Text>
          {data.education.map((edu) => (
            <View key={edu.id} className="mb-4">
              <View className="flex-row items-center justify-between">
                <Text className="font-bold text-gray-900">{edu.degree}</Text>
                <Text className="text-xs text-gray-600">{edu.graduationDate}</Text>
              </View>
              <Text className="text-sm text-gray-600">{edu.school}</Text>
              <Text className="text-sm text-gray-600">{edu.field}</Text>
              {edu.details && <Text className="mt-1 text-sm text-gray-700">{edu.details}</Text>}
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <View className="mt-6">
          <Text className="mb-3 text-lg font-bold text-gray-900">SKILLS</Text>
          <View className="flex-row flex-wrap gap-2">
            {data.skills.map((skill) => (
              <View key={skill.id} className="rounded-full bg-blue-100 px-3 py-1">
                <Text className="text-xs font-medium text-blue-900">{skill.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Footer Spacing */}
      <View className="mt-8" />
    </ScrollView>
  );
}

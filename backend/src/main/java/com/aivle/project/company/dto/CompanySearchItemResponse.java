package com.aivle.project.company.dto;

/**
 * 기업 검색 항목 DTO.
 */
public record CompanySearchItemResponse(
	Long companyId,
	String name,
	String code,
	CompanySectorResponse sector
) {
}
